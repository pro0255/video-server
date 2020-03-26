export interface User {
    isCall: boolean;
    socket: any;
    name: string;
}

interface Users_Dic {
    [id: string]: User
}

const users: Users_Dic = {};


export const createUser = (socket: any, id: string) => {
    users[id] = {socket: socket, isCall: false, name: id}; //tady bacha
    return users[id];
};

export const getUser = (id: string) => {
    return users[id];
};

export const deleteUser = (id: string) => {
    delete users[id];
};

export const getAll = () => {
    return users;
};
