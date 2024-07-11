import React, { useState, useEffect } from 'react';

function List() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 여기서 서버에서 데이터를 가져오는 등의 로직을 구현할 수 있습니다.
    setData([
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com' },
    ]);
  }, []);

  return (
    <div>
      <h1>List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default List;
