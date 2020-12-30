import bcryptjs from 'bcryptjs';

const users = [
    {
        name: 'Zach Tucker',
        email: 'zbtucker@gmail.com',
        password: bcryptjs.hashSync('123456', 10),
        isAdmin: true
    },
]

export default users;