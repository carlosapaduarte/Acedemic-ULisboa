import { useState } from "react";

export function useTags() {
    const [tags, setTags] = useState<string[]>([]);

    function removeTag(tag: string) {
        if (tags == undefined)
            return;
        const new_tags = tags.filter((t: string) => t != tag);
        setTags(new_tags);
    }

    function appendTag(tag: string) {
        let new_tags;
        if (tags == undefined)
            new_tags = [tag];
        else {
            if (tags.includes(tag))
                return;
            new_tags = [...tags];
            new_tags.push(tag);
        }
        setTags(new_tags);
    }

    return { tags, appendTag, removeTag };
}