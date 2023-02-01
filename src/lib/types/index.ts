export type table_type = {
    [x: number]: {
        fixed: boolean;
        resizable: boolean;
        draggable: boolean;
        customDragger: boolean;
        customResizer: boolean;
        x: number;
        y: number;
        w: number;
        h: number;
        min: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        max: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
    };
    id: string;
}[];

export type main_conf_type = {
    [id: string]: {
        name: string;
        desription: string;
        photo: string | ArrayBuffer;
        photo_flag: boolean;
        funcs: {
            [func_id: string]: {
                name: string;
                desription: string;
            };
        };
        funcs_num_position: string[];
        funcs_graph_position: {
            graphs: {
                id: string;
                color: string;
            }[];
            point_quantity: number;
        }[];
    }
}