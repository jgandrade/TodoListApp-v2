const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

client.connect((err, db) => {
    if (err) throw err;
    const currentDb = db.db('todoListV2Db');
    currentDb.collection('list').find({}).toArray((err, results) => {
        results.forEach(e => {
            task_array.push(e);
        });
        db.close();
    });
});

let task_array = [];

app.get('/', (req, res) => {
    setTimeout(() => {
        task_array.forEach((e, i) => {
            app.post('/' + task_array[i]._id, (req, res) => {
                let input = req.body.task;
                let regex = /^\s*$/;
                let truth = regex.test(input);
                if (truth === false) {
                    client.connect((err, db) => {
                        if (err) throw err;
                        const currentDb = db.db('todoListV2Db');
                        let newTask = task_array[i].tasks;
                        let isItTrue = task_array[i].tasks.some(e => e == input);
                        if (isItTrue === false) {
                            newTask.push(input);
                            currentDb.collection('list').updateOne({ _id: task_array[i]._id }, { $set: { tasks: newTask } }, (err) => {
                                if (err) throw err;
                                db.close();
                            });
                        } else {
                            db.close();
                        }
                    });
                    setTimeout(() => res.redirect(`/#${task_array[i]._id}`), 50);
                } else {
                    setTimeout(() => res.redirect(`/#${task_array[i]._id}`), 50);
                }
            });
            app.post('/delete' + e._id, (req, res) => {
                client.connect((err, db) => {
                    if (err) throw err;
                    const currentDb = db.db('todoListV2Db');
                    currentDb.collection('list').deleteOne({ _id: e._id }, (err) => {
                        if (err) throw err;
                        db.close();
                    });
                });
                task_array = task_array.filter(el => el._id != e._id);
                setTimeout(() => res.redirect('/'), 50);
            });
            if (task_array[i].tasks.length > 0) {
                task_array[i].tasks.forEach((el, j) => {
                    app.post('/task' + j + '_' + task_array[i]._id, (req, res) => {
                        client.connect((err, db) => {
                            if (err) throw err;
                            const currentDb = db.db('todoListV2Db');
                            task_array[i].tasks = task_array[i].tasks.filter(e => e !== task_array[i].tasks[j]);
                            currentDb.collection('list').updateOne({ _id: task_array[i]._id }, { $set: { tasks: task_array[i].tasks } }, (err) => {
                                if (err) throw err;
                                db.close();
                            });
                        });
                        setTimeout(() => res.redirect(`/#${task_array[i]._id}`), 50);
                    });
                });
            }
        });
    }, 50);
    setTimeout(() => res.render('main', { task: task_array }), 50);
});

app.post('/', (req, res) => {
    let input = req.body.todo;
    let regex = /^\s*$/;
    let truth = regex.test(input);
    if (truth === false) {
        //CREATE THE INPUT TO DATABASE
        client.connect((err, db) => {
            if (err) throw err;
            const currentDb = db.db('todoListV2Db');
            const objectToInsert = { task_name: input, tasks: [] };
            currentDb.collection('list').insertOne(objectToInsert, (err) => {
                if (err) throw err;
                task_array.push({ _id: objectToInsert._id, task_name: objectToInsert.task_name, tasks: objectToInsert.tasks });
                db.close();
            });
        });
        setTimeout(() => res.redirect('/'), 50);
    } else {
        setTimeout(() => res.redirect('/'), 50);
    }
});

app.listen(process.env.port || 3000, () => {
    console.log('Server started');
});