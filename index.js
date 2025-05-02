require('dotenv').config();  // ⬅️ 這一行一定要放最上面！
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const API_BASE = process.env.API_BASE || '';

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'quiz_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected.');
});

app.get('/api/questions', (req, res) => {
    db.query('SELECT * FROM questions ORDER BY RAND() LIMIT 5', (err, results) => {
      if (err) return res.status(500).send(err);
  
      const formatted = results.map(q => ({
        ...q,
        options:
          typeof q.options === 'string'
            ? JSON.parse(q.options)
            : q.options
      }));
  
      res.json(formatted);
    });
  });
  
    

  app.post('/api/answer', (req, res) => {
    const { user_id, question_id, selected_option } = req.body;
  
    if (!user_id || !question_id || !selected_option) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    db.query(
      'SELECT correct_option FROM questions WHERE id = ?',
      [question_id],
      (err, results) => {
        if (err) return res.status(500).send(err);
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'Question not found' });
        }
  
        const correct_option = results[0].correct_option;
        const is_correct = selected_option === correct_option;
  
        db.query(
          'INSERT INTO user_answers (user_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
          [user_id, question_id, selected_option, is_correct],
          err2 => {
            if (err2) return res.status(500).send(err2);
            res.json({ correct_option, is_correct });
          }
        );
      }
    );
  });
  

app.listen(3001, '0.0.0.0', () => {
    console.log('Server running on port 3001');
  });
       
