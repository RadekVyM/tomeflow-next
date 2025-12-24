import ParagraphSkeleton from "@/app/components/skeleton/ParagraphSkeleton";

export default function DocumentContentSkeleton() {
    return (
        <article
            className="markdown">
            <ParagraphSkeleton
                className="mb-3"
                lastParagraphWidth="w-1/2" />
            <ParagraphSkeleton />
        </article>
    );
}