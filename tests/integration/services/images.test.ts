import { describe, it, expect, beforeEach, vi } from "vitest";
import * as imagesService from "@/app/services/images";
import { createTestUser } from "../fixtures/users";
import { createTestProject } from "../fixtures/projects";
import { createTestImage } from "../fixtures/images";

describe("Images Service Integration Tests", () => {
    let testUserId: string;
    let testProjectId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        testUserId = user.id;
        testProjectId = await createTestProject(testUserId, "Test Project");
    });

    describe("createImage", () => {
        it("should create an image with valid data", async () => {
            const imageId = crypto.randomUUID();
            const blobUrl = `https://example.com/images/${imageId}.png`;

            const resultId = await imagesService.createImage(
                imageId,
                blobUrl,
                "My Image",
                testProjectId,
                testUserId);

            expect(resultId).toBe(imageId);

            const image = await imagesService.getImage(testUserId, resultId);
            expect(image).toBeDefined();
            expect(image?.title).toBe("My Image");
            expect(image?.blobUrl).toBe(blobUrl);
            expect(image?.userId).toBe(testUserId);
            expect(image?.projectId).toBe(testProjectId);
        });

        it("should create multiple images in same project", async () => {
            const id1 = await createTestImage(testUserId, testProjectId, "Image 1");
            const id2 = await createTestImage(testUserId, testProjectId, "Image 2");

            expect(id1).not.toBe(id2);

            const images = await imagesService.getImagesFromProject(testUserId, testProjectId);
            expect(images.length).toBeGreaterThanOrEqual(2);
        });

        it("should set uploadedAt timestamp on creation", async () => {
            const before = Date.now();
            const imageId = await createTestImage(testUserId, testProjectId, "Timestamped Image");
            const after = Date.now();

            const image = await imagesService.getImage(testUserId, imageId);

            expect(image?.uploadedAt).toBeGreaterThanOrEqual(before);
            expect(image?.uploadedAt).toBeLessThanOrEqual(after);
        });
    });

    describe("getImage", () => {
        it("should retrieve an existing image", async () => {
            const imageId = await createTestImage(testUserId, testProjectId, "Fetch Test");

            const retrieved = await imagesService.getImage(testUserId, imageId);

            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe(imageId);
            expect(retrieved?.title).toBe("Fetch Test");
        });

        it("should return undefined for non-existent image", async () => {
            const retrieved = await imagesService.getImage(
                testUserId,
                crypto.randomUUID());
            expect(retrieved).toBeUndefined();
        });

        it("should not allow fetching other user's image", async () => {
            const otherUser = await createTestUser();
            const imageId = await createTestImage(testUserId, testProjectId, "Private Image");

            const retrieved = await imagesService.getImage(otherUser.id, imageId);
            expect(retrieved).toBeUndefined();
        });
    });

    describe("getImagesFromProject", () => {
        it("should retrieve all images for a project", async () => {
            await createTestImage(testUserId, testProjectId, "Image 1");
            await createTestImage(testUserId, testProjectId, "Image 2");
            await createTestImage(testUserId, testProjectId, "Image 3");

            const images = await imagesService.getImagesFromProject(testUserId, testProjectId);

            expect(images.length).toBeGreaterThanOrEqual(3);
            const titles = images.map((i) => i.title);
            expect(titles).toContain("Image 1");
            expect(titles).toContain("Image 2");
            expect(titles).toContain("Image 3");
        });

        it("should return empty array for project with no images", async () => {
            const newProject = await createTestProject(testUserId, "Empty Project");
            const images = await imagesService.getImagesFromProject(testUserId, newProject);
            expect(images).toHaveLength(0);
        });

        it("should only return images for specified project", async () => {
            const project2 = await createTestProject(testUserId, "Project 2");

            const img1Id = await createTestImage(testUserId, testProjectId, "Project1 Image");
            const img2Id = await createTestImage(testUserId, project2, "Project2 Image");

            const project1Images = await imagesService.getImagesFromProject(
                testUserId,
                testProjectId);

            const project2Images = await imagesService.getImagesFromProject(
                testUserId,
                project2);

            expect(project1Images).toHaveLength(1);
            expect(project1Images[0].id).toBe(img1Id);
            expect(project2Images).toHaveLength(1);
            expect(project2Images[0].id).toBe(img2Id);
        });

        it("should not return images from other users", async () => {
            const otherUser = await createTestUser();
            const otherProjectId = await createTestProject(otherUser.id, "Other Project");

            await createTestImage(testUserId, testProjectId, "My Image");
            await createTestImage(otherUser.id, otherProjectId, "Other Image");

            const myImages = await imagesService.getImagesFromProject(
                testUserId,
                testProjectId);
            expect(myImages).toHaveLength(1);
            expect(myImages[0].title).toBe("My Image");
        });
    });

    describe("getImages", () => {
        it("should retrieve multiple images by IDs", async () => {
            const id1 = await createTestImage(testUserId, testProjectId, "Image 1");
            const id2 = await createTestImage(testUserId, testProjectId, "Image 2");
            const id3 = await createTestImage(testUserId, testProjectId, "Image 3");

            const images = await imagesService.getImages(testUserId, [id1, id3]);

            expect(images).toHaveLength(2);
            const ids = images.map((i) => i.id);
            expect(ids).toContain(id1);
            expect(ids).toContain(id3);
            expect(ids).not.toContain(id2);
        });

        it("should return empty array for non-existent IDs", async () => {
            const images = await imagesService.getImages(
                testUserId,
                [crypto.randomUUID(), crypto.randomUUID()]);
            expect(images).toHaveLength(0);
        });

        it("should not return images from other users", async () => {
            const otherUser = await createTestUser();
            const otherProjectId = await createTestProject(otherUser.id, "Other Project");

            const myId = await createTestImage(testUserId, testProjectId, "My Image");
            const otherId = await createTestImage(otherUser.id, otherProjectId, "Other Image");

            const myImages = await imagesService.getImages(testUserId, [myId, otherId]);

            expect(myImages).toHaveLength(1);
            expect(myImages[0].id).toBe(myId);
        });
    });

    describe("deleteImage", () => {
        it("should delete an existing image", async () => {
            const imageId = await createTestImage(testUserId, testProjectId, "To Delete");

            await imagesService.deleteImage(testUserId, imageId);

            const retrieved = await imagesService.getImage(testUserId, imageId);
            expect(retrieved).toBeUndefined();
        });

        it("should throw when deleting non-existent image", async () => {
            await expect(
                imagesService.deleteImage(testUserId, crypto.randomUUID())
            ).rejects.toThrow();
        });

        it("should not allow deleting other user's image", async () => {
            const otherUser = await createTestUser();
            const imageId = await createTestImage(testUserId, testProjectId, "Test");

            await expect(
                imagesService.deleteImage(otherUser.id, imageId)
            ).rejects.toThrow();

            const retrieved = await imagesService.getImage(testUserId, imageId);
            expect(retrieved).toBeDefined();
        });
    });

    describe("deleteImagesFromProject", () => {
        it("should delete all images from a project", async () => {
            await createTestImage(testUserId, testProjectId, "Image 1");
            await createTestImage(testUserId, testProjectId, "Image 2");

            await imagesService.deleteImagesFromProject(testUserId, testProjectId);

            const images = await imagesService.getImagesFromProject(
                testUserId,
                testProjectId);
            expect(images).toHaveLength(0);
        });

        it("should not throw when project has no images", async () => {
            await expect(
                imagesService.deleteImagesFromProject(testUserId, testProjectId)
            ).resolves.toBeUndefined();
        });

        it("should not delete images from other user's project", async () => {
            const otherUser = await createTestUser();
            const otherProjectId = await createTestProject(otherUser.id, "Other Project");

            await createTestImage(testUserId, testProjectId, "My Image");

            await imagesService.deleteImagesFromProject(otherUser.id, testProjectId);

            const myImages = await imagesService.getImagesFromProject(
                testUserId,
                testProjectId);
            expect(myImages).toHaveLength(1);
        });
    });

    describe("Authorization", () => {
        it("should enforce user isolation across operations", async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();

            const project1 = await createTestProject(user1.id, "Project 1");
            const project2 = await createTestProject(user2.id, "Project 2");

            const img1Id = await createTestImage(user1.id, project1, "User 1 Image");
            const img2Id = await createTestImage(user2.id, project2, "User 2 Image");

            const user1Images = await imagesService.getImagesFromProject(user1.id, project1);
            const user2Images = await imagesService.getImagesFromProject(user2.id, project2);

            expect(user1Images).toHaveLength(1);
            expect(user2Images).toHaveLength(1);
            expect(user1Images[0].id).toBe(img1Id);
            expect(user2Images[0].id).toBe(img2Id);
        });
    });
});