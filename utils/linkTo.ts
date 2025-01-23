export const toGithub = (projectName?: string) => {
    window.open(`https://github.com/gaojunran${projectName? `/${projectName}` : ''}`, '_blank')
}

export const toWhere = (url: string) => {
    window.open(url, '_blank')
}