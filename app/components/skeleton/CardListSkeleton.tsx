import CardList from "../card-list/CardList";
import CardListItemSkeleton from "./CardListItemSkeleton";

export default function CardListSkeleton(props: {
    className?: string,
    itemsCount?: number,
    withIcon?: boolean,
    withSubtitle?: boolean,
}) {
    const itemsCount = props.itemsCount !== undefined ? props.itemsCount : 6;

    return (
        <CardList
            className={props.className}>
            {new Array(itemsCount).fill(null).map((_, index) =>
                <CardListItemSkeleton
                    key={index}
                    withIcon={props.withIcon}
                    withSubtitle={props.withSubtitle} />)}
        </CardList>
    );
}