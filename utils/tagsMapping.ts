
const tagsMapping = [
    {
        "tag": "Python",
        "color": "#81c6f8",
    },
    {
        "tag": "Java",
        "color": "#B07219",
    },
    {
        "tag": "JavaScript",
        "color": "#F1E05A",
    },
    {
        "tag": "C++",
        "color": "#F34B7D",
    },
    {
        "tag": "C",
        "color": "#555555",
    },
    {
        "tag": "PHP",
        "color": "#4F5D95",
    },
    {
        "tag": "Ruby",
        "color": "#701516",
    },
    {
        "tag": "Swift",
        "color": "#FFAC45",
    },
    {
        "tag": "Go",
        "color": "#00ADD8",
    },
    {
        "tag": "Kotlin",
        "color": "#C233F1",
    },
    {
        "tag": "Vue",
        "color": "#41B883",
    },
    {
        "tag": "Rust",
        "color": "#DEA584",
    },
    {
        "tag": "TypeScript",
        "color": "#3178C6",
    }
]

export const getTagColor = (tag: string) => {
    const result = tagsMapping.find(item => item.tag === tag);
    return result ? result.color : "#ffffff";
}
