import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Card,
  Form,
  ButtonGroup,
  Row,
  Col,
} from 'react-bootstrap';

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch('/test.txt')
      .then((res) => res.text())
      .then((text) => {
        const q = parseQuestions(text);
        setQuestions(q);
      });
  }, []);

  const parseQuestions = (text) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const question = lines[i++];
      const options = [];
      while (i < lines.length && lines[i].startsWith('ответ')) {
        const line = lines[i++];
        const isCorrect = line.startsWith('ответ +');
        const text = line.slice(8).trim();
        options.push({ text, isCorrect });
      }
      result.push({ question, options });
    }
    return result;
  };

  const handleToggle = (idx) => {
    const prev = answers[current] || [];
    const next = [...prev];
    next[idx] = !next[idx];
    setAnswers({ ...answers, [current]: next });
  };

  const handleFinish = () => {
    let correctCount = 0;

    questions.forEach((q, i) => {
      const user = answers[i] || [];
      const correct = q.options.map((opt) => opt.isCorrect);
      const normalizedUser = correct.map((_, idx) => !!user[idx]); // явный false для undefined

      if (
        correct.length === normalizedUser.length &&
        correct.every((val, idx) => val === normalizedUser[idx])
      ) {
        correctCount++;
      }

      console.log('User:', normalizedUser, 'Correct:', correct);
    });

    const percent = (correctCount / questions.length) * 100;
    let grade = 1;
    if (percent >= 90) grade = 5;
    else if (percent >= 75) grade = 4;
    else if (percent >= 60) grade = 3;
    else if (percent >= 45) grade = 2;

    alert(`Правильных ответов: ${correctCount} из ${questions.length}
Процент: ${percent.toFixed(1)}%
Оценка: ${grade}`);
  };

  const currentAnswers = answers[current] || [];

  return (
    <Container className="mt-4">
      <h2>Тест по Unity Intermediate</h2>

      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={12}>
          <ButtonGroup className="mb-3 flex-wrap w-100">
            {questions.map((_, i) => (
              <Button
                key={i}
                variant={
                  i === current
                    ? 'primary'
                    : answers[i] &&
                      questions[i].options.some(
                        (opt, idx) => answers[i][idx] && opt.isCorrect
                      )
                    ? 'success'
                    : 'outline-secondary'
                }
                size="sm"
                className="me-1 mb-1"
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </Button>
            ))}
          </ButtonGroup>

          {questions[current] && (
            <Card className="mb-3 p-3">
              <Card.Title>
                {current + 1}. {questions[current].question}
              </Card.Title>
              <Form>
                {questions[current].options.map((opt, idx) => (
                  <Form.Check
                    key={idx}
                    type="checkbox"
                    id={`q${current}-opt${idx}`}
                    label={opt.text}
                    checked={!!currentAnswers[idx]}
                    onChange={() => handleToggle(idx)}
                    className="mb-2"
                  />
                ))}
              </Form>
            </Card>
          )}

          <Row>
            <Col xs="auto">
              <Button
                variant="secondary"
                disabled={current === 0}
                onClick={() => setCurrent((prev) => prev - 1)}
              >
                Назад
              </Button>
            </Col>
            <Col xs="auto">
              <Button
                variant="secondary"
                disabled={current === questions.length - 1}
                onClick={() => setCurrent((prev) => prev + 1)}
              >
                Вперед
              </Button>
            </Col>
            <Col xs="auto" className="ms-auto">
              <Button variant="success" onClick={handleFinish}>
                Завершить тест
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
