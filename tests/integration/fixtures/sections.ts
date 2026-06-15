import * as boardSectionsService from "@/app/services/board-sections";

export async function createTestBoardSection(
userId: string,
boardId: string,
position: number,
title: string = "Test Section"
) {
return await boardSectionsService.createBoardSection(
`section-${crypto.randomUUID()}`,
title,
position,
userId,
boardId
);
}
