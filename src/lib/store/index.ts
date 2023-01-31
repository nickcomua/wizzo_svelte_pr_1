import { readable, writable, get, type Subscriber } from "svelte/store";
import type { main_conf_type, table_type } from "$lib/types";

let grid_config: table_type = []
let main_config: main_conf_type = {
    '1': {
        name: 'Oven 1',
        desription: 'Hal-1',
        photo: '/img/1.jpeg',
        photo_flag: true,
        funcs: {
            '1': { name: 'func 1', desription: 'desc 1' },
            '2': { name: 'func 2', desription: 'desc 2' },
            '3': { name: 'func 3', desription: 'desc 3' }
        },
        funcs_num_position: ['2', '1', '3'],
        funcs_graph_position: [
            { graphs: [{ id: '1', color: 'red' }], point_quantity: 10 },
            { graphs: [{ id: '3', color: 'red' }], point_quantity: 15 },
            { graphs: [{ id: '2', color: 'red' }], point_quantity: 20 }
        ]
    },
    '2': {
        name: 'Oven 2',
        desription: 'Hal-1',
        photo: '/img/2.jpeg',
        photo_flag: true,
        funcs: {
            '4': { name: 'func 1', desription: 'desc 1' },
            '5': { name: 'func 2', desription: 'desc 2' },
            '6': { name: 'func 3', desription: 'desc 3' }
        },
        funcs_num_position: ['6', '5', '4'],
        funcs_graph_position: [
            { graphs: [{ id: '5', color: 'red' }], point_quantity: 10 },
            {
                graphs: [
                    { id: '4', color: 'red' },
                    { id: '6', color: 'blue' }
                ],
                point_quantity: 20
            }
        ]
    },
    '3': {
        name: 'Oven 3',
        desription: 'Hal-1',
        photo: '/img/3.jpeg',
        photo_flag: false,
        funcs: {
            '7': { name: 'func 1', desription: 'desc 1' },
            '8': { name: 'func 2', desription: 'desc 2' },
            '9': { name: 'func 3', desription: 'desc 3' }
        },
        funcs_num_position: ['7', '8', '9'],
        funcs_graph_position: [
            { graphs: [{ id: '8', color: 'red' }], point_quantity: 10 },
            { graphs: [{ id: '9', color: 'red' }], point_quantity: 15 }
        ]
    }
}

export const store = writable({
    grid_config,
    main_config
})




export const data = readable({}, (set: Subscriber<{ [func: string]: { value: number, time: number } }>) => {
    const interval = setInterval(() => {
        let func_ids: string[] = []
        let main_config = get(store).main_config
        for (let id in main_config) {
            func_ids = [...func_ids, ...Object.keys(main_config[id].funcs)]
        }
        let ans: { [func: string]: { value: number, time: number } } = {}
        func_ids.forEach((func: string) => {
            fetch(`http://localhost/lastnvalue.php?id=${func}&n=1`).then((data) => data.json()).then((val) => {
                //console.log(val);
                ans = { ...ans, [func]: { value: Math.round(val[0].temperature * 100) / 100, time: val[0].id } }
            }).catch((ex) => {
                console.log(ex);
            }).then(() => { if (Object.keys(ans).length == func_ids.length && Object.keys(ans).length != 0) set(ans) })
        })
    }, 1000);

    return function stop() {
        clearInterval(interval);
    };
});

const graphs_data_generate = () : {[id:string]:number[][][][]}  => {
    let main_config = get(store).main_config
    return Object.fromEntries(Object.keys(main_config).map(id =>
        [id, main_config[id].funcs_graph_position.map((val) => val.graphs.map(_ => Array.from({ length: val.point_quantity }, (_, i) => [i, Math.random() * 100])))]))//[i+1, Math.random()*100]))]))
}

const graphs_data_get = async (): Promise<{[id:string]:number[][][][]}> => {
    let main_config: main_conf_type = get(store).main_config
    return Object.fromEntries(
        await Promise.all(
            Object.keys(main_config).map(async (id) =>
                [id, await Promise.all(main_config[id].funcs_graph_position.map(async (val) => await Promise.all(val.graphs.map(async (final) =>
                    fetch(`http://localhost/lastnvalue.php?id=${final.id}&n=${val.point_quantity}`).
                        then(x => x.json()).
                        then((
                            temp: { stime: string, temperature: string }[]) =>
                            temp.map(x =>
                                [parseFloat(x.stime) * 1000, parseFloat(x.temperature)])
                        )))))])))
}

export const graphs_data = readable(graphs_data_generate(), (set) => {
    const interval = setInterval(() => {
        graphs_data_get().then(x => {
            ; set(x)
        })
    }
        , 1000)
    return () => clearInterval(interval)
})
