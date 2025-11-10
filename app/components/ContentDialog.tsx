import { cn } from "../utils/tailwind";
import { Dialog, type DialogProps } from "./Dialog";
import { MdClose } from "react-icons/md";
import Button from "./input/Button";

export default function ContentDialog(props: {
    ref: React.RefObject<HTMLDialogElement | null>,
    heading: React.ReactNode,
    outerClassName?: string,
    headerClassName?: string,
    onCloseClick?: () => void,
} & DialogProps) {
    return (
        <Dialog
            ref={props.ref}
            state={props.state}
            onEscape={props.onCloseClick}
            outerClassName={props.outerClassName}
            className={cn("px-5 pb-4 thin-scrollbar rounded-xl bg-surface-container isolate flex flex-col", props.className)}>
            <header
                className={cn("flex justify-between items-start z-50 bg-inherit pt-4 pb-2", props.headerClassName)}>
                <h2 className="font-semibold text-xl">{props.heading}</h2>
                <Button
                    variant="icon-default"
                    onClick={async () => {
                        if (props.onCloseClick) {
                            props.onCloseClick();
                        }
                        else {
                            await props.state.hide();
                        }
                    }}>
                    <MdClose className="w-5 h-5" />
                </Button>
            </header>

            {props.children}
        </Dialog>
    );
}