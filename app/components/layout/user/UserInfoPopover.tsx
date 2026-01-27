import { User } from "next-auth";
import SignOutButton from "./SignOutButton";
import MenuPopover from "../MenuPopover";

export default function UserInfoPopover(props: {
    userInfo: User,
}) {
    return (
        <MenuPopover
            className="top-2"
            id="userinfo-popover">
            <div
                className="flex flex-col">
                <h2
                    className="font-semibold text-lg">
                    {props.userInfo.name}
                </h2>
                <small
                    className="text-on-surface-container-muted mb-3">
                    {props.userInfo.email}
                </small>

                <SignOutButton />
            </div>
        </MenuPopover>
    );
}