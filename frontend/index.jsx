import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [curr, setCurr] = useState('');

  useEffect(async () => {
    const res = await fetch('http://localhost:3000');
    const data = await res.text();
    setCurr(data);
  }, []);

  return (
    <div>
      Hello,
      {' '}
      {curr}
      {' '}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
