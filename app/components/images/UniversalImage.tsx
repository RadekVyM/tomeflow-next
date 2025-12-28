import LocalImage from "./LocalImage";

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UniversalImage(props: {
    src?: string | Blob,
    alt?: string,
    title?: string,
    className?: string,
}) {
    const isLocalImage = !!props.src && typeof props.src === "string" && GUID_REGEX.test(props.src);

    if (props.src && typeof props.src === "string" && isLocalImage) {
        return (
            <LocalImage
                className={props.className}
                imageId={props.src} />
        );
    }

    return (
        <img
            {...props} />
    );
}