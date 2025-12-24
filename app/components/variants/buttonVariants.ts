import { cva } from "class-variance-authority";

/** All the possible variants of a button. */
export const buttonVariants = cva(
    "btn",
    {
        variants: {
            variant: {
                default:
                    "btn-default",
                destructive:
                    "btn-destructive",
                primary:
                    "btn-primary",
                secondary:
                    "btn-secondary",
                container:
                    "btn-container",
                plain:
                    "",
                "icon-default":
                    "btn-default btn-icon px-0",
                "icon-destructive":
                    "btn-destructive btn-icon px-0",
                "icon-primary":
                    "btn-primary btn-icon px-0",
                "icon-secondary":
                    "btn-secondary btn-icon px-0",
                "icon-container":
                    "btn-container btn-icon px-0",
                "icon-plain":
                    "",
                "dynamic-default":
                    "btn-default btn-dynamic max-sm:px-0",
                "dynamic-destructive":
                    "btn-destructive btn-dynamic max-sm:px-0",
                "dynamic-primary":
                    "btn-primary btn-dynamic max-sm:px-0",
                "dynamic-secondary":
                    "btn-secondary btn-dynamic max-sm:px-0",
                "dynamic-container":
                    "btn-container btn-dynamic max-sm:px-0",
                "dynamic-plain":
                    "",
            },
            size: {
                default: "btn-md",
                sm: "btn-sm",
                lg: "btn-lg",
            },
        },
        compoundVariants: [
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "default",
                className: "min-w-8",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "sm",
                className: "min-w-7",
            },
            {
                variant: ["icon-container", "icon-default", "icon-destructive", "icon-primary", "icon-secondary", "icon-plain"],
                size: "lg",
                className: "min-w-10",
            },
            {
                variant: ["dynamic-container", "dynamic-default", "dynamic-destructive", "dynamic-primary", "dynamic-secondary", "dynamic-plain"],
                size: "default",
                className: "max-sm:min-w-8",
            },
            {
                variant: ["dynamic-container", "dynamic-default", "dynamic-destructive", "dynamic-primary", "dynamic-secondary", "dynamic-plain"],
                size: "sm",
                className: "max-sm:min-w-7",
            },
            {
                variant: ["dynamic-container", "dynamic-default", "dynamic-destructive", "dynamic-primary", "dynamic-secondary", "dynamic-plain"],
                size: "lg",
                className: "max-sm:min-w-10",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);