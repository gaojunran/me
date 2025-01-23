
const languageMapping = [
    {
        "lang": "Python",
        "color": "#81c6f8",
    },
    {
        "lang": "Java",
        "color": "#B07219",
    },
    {
        "lang": "JavaScript",
        "color": "#F1E05A",
    },
    {
        "lang": "C++",
        "color": "#F34B7D",
    },
    {
        "lang": "C",
        "color": "#555555",
    },
    {
        "lang": "PHP",
        "color": "#4F5D95",
    },
    {
        "lang": "Ruby",
        "color": "#701516",
    },
    {
        "lang": "Swift",
        "color": "#FFAC45",
    },
    {
        "lang": "Go",
        "color": "#00ADD8",
    },
    {
        "lang": "Kotlin",
        "color": "#C233F1",
    },
    {
        "lang": "Vue",
        "color": "#41B883",
    },
    {
        "lang": "Rust",
        "color": "#DEA584",
    }
]

export const getLanguageColor = (language: string) => {
    const lang = languageMapping.find(lang => lang.lang === language);
    return lang ? lang.color : "#ffffff";
}
