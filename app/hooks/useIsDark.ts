import useMediaQuery from "./useMediaQuery";

export default function useIsDark() {
    return useMediaQuery("(prefers-color-scheme: dark)");
}