// @ts-nocheck
import Image from "next/image";

export default function LocalImage(props: {
    imageId: string,
    className?: string,
}) {
    const { isLoading, error, data: image } = useDataImageDto(props.imageId);

    if (isLoading) {
        return "Loading...";
    }

    if (error || !image) {
        return "Image could not be loaded.";
    }

    return (
        <Image
            src={image.dataUrl}
            className={props.className}
            alt={""} />
    );
}