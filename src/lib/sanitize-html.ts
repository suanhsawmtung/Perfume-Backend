import sanitizeHtmlLib from "sanitize-html";

export const cleanHtmlRich = (html: string) => {
    return sanitizeHtmlLib(html, {
        allowedTags: [
            "p",
            "h1",
            "h2",
            "h3",
            "ul",
            "ol",
            "li",
            "strong",
            "em",
            "a",
            "img",
            "blockquote",
            "code",
            "pre",
            "br",
            "b",
            "i"
        ],

        allowedAttributes: {
            a: ["href", "target", "title"],
            img: ["src", "alt"],
        },
    });
}

export const cleanHtmlPlain = (html: string) => {
    return sanitizeHtmlLib(html, {
        allowedTags: [],
        allowedAttributes: {},
    });
}