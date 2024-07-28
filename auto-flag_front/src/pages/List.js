import React, { useState, useEffect } from 'react';
import axios from 'axios';

function List() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/board/list')
      .then(response => {
        console.log('응답 데이터:', response.data); // 응답 데이터 구조 확인
        const responseData = response.data;
        if (responseData && responseData.dtoList) {
          setData(responseData.dtoList);
        } else {
          console.error('예상치 못한 데이터 구조:', responseData);
          setData([]); // 데이터를 가져오지 못한 경우 빈 배열로 초기화
        }
      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setData([]); // 오류 발생 시 빈 배열로 초기화
      });
  }, []);
  

  return (
    <div>
      <h1>List</h1>
      <table>
        <thead>
          <tr>
            <th>BNO</th>
            <th>Address</th>
            <th>Memo</th>
            <th>latitude</th>
            <th>longitude</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.bno}>
              <td>{item.bno}</td>
              <td>{item.address}</td>
              <td>{item.memo}</td>
              <td>{item.latitude}</td>
              <td>{item.longitude}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default List;
