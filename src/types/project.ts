export interface ProjectProperty{
    user_id: number,
    project_name: string,
    project_data: string,
    preview_image_url?: string,
    status: 1|2|3|4, //状态(1:草稿,2:已保存,3:已发布,4:已删除)
}

export type SaveProjectProperty = Pick<ProjectProperty, 'project_data' | 'preview_image_url'> & Record<'id', number>;