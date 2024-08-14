import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './List.css';

function List() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // 상태 업데이트 여부 확인용
  const GOOGLE_CLOUD_GEOCODING_API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_GEOCODING_API_KEY;

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_CLOUD_GEOCODING_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log('Google Maps API loaded');
        initializeMap();
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [selectedItem]);

  const fetchList = () => {
    axios
      .get('/board/list')
      .then((response) => {
        console.log('응답 데이터:', response.data);
        const responseData = response.data;
        if (responseData && responseData.dtoList) {
          console.log('dtoList 데이터:', responseData.dtoList);
          setData(responseData.dtoList);
        } else {
          console.error('예상치 못한 데이터 구조:', responseData);
          setData([]);
        }
      })
      .catch((error) => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setData([]);
      });
  };

  const handleRowClick = (item) => {
    console.log('클릭된 항목:', item);
    setSelectedItem(item);
    setIsEditing(false);
  };

  const handleModify = async () => {
    if (!selectedItem) return;
  
    if (isEditing) {
      setIsUpdating(true); // 업데이트 시작
  
      try {
        // 주소를 기준으로 위도와 경도 업데이트
        await updateCoordinates();
  
        // 여기서 상태가 완전히 업데이트된 후 PUT 요청을 보냄
        setSelectedItem((prevItem) => {
          axios.put(`/board/${prevItem.bno}`, prevItem)
            .then(response => {
              console.log('서버 응답:', response.data);
              fetchList();
            })
            .catch(error => {
              console.error('수정 실패:', error);
            })
            .finally(() => {
              setIsUpdating(false); // 업데이트 종료
            });
  
          return prevItem;  // 상태 반환
        });
      } catch (error) {
        console.error('수정 실패:', error);
        setIsUpdating(false); // 업데이트 종료
      }
    }
  
    setIsEditing(!isEditing);
  };
  

  const updateCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (!selectedItem || !selectedItem.address) {
        resolve(); // 주소가 비어있으면 바로 resolve
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedItem.address }, (results, status) => {
        if (status === 'OK') {
          const { lat, lng } = results[0].geometry.location;
          setSelectedItem((prevItem) => ({
            ...prevItem,
            latitude: lat().toString(),
            longitude: lng().toString(),
          }));
          resolve();
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          reject(status);
        }
      });
    });
  };

  useEffect(() => {
    if (isUpdating && selectedItem) {
      initializeMap(); // 상태가 업데이트되었을 때 지도를 초기화
    }
  }, [selectedItem, isUpdating]);

  const initializeMap = () => {
    if (!selectedItem) return;

    console.log('선택된 항목:', selectedItem);

    const map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: new window.google.maps.LatLng(selectedItem.latitude, selectedItem.longitude),
    });

    new window.google.maps.Marker({
      position: new window.google.maps.LatLng(selectedItem.latitude, selectedItem.longitude),
      map: map,
      title: selectedItem.address,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    axios
      .delete(`/board/${selectedItem.bno}`)
      .then((response) => {
        console.log('삭제 성공:', response.data);
        setSelectedItem(null);
        fetchList();
      })
      .catch((error) => {
        console.error('삭제 실패:', error);
      });
  };

  return (
    <div>
      <h1>List</h1>
      <div className='total-container'>
        <table className='list-container'>
          <thead>
            <tr>
              <th>BNO</th>
              <th>Address</th>
              <th>Memo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr className='list-item' key={item.bno} onClick={() => handleRowClick(item)}>
                <td>{item.bno}</td>
                <td>{item.address}</td>
                <td>{item.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='detail-container'>
          <h2>Details</h2>

          {selectedItem && (
            <div>
              <img src={selectedItem.imagePath} alt='Selected' className='selected-image' />
            </div>
          )}

          <h3>Map</h3>

          <div id='map' className='map-container'></div>

          {selectedItem && (
            <div>
              <p>
                <strong>Latitude:</strong> {selectedItem.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {selectedItem.longitude}
              </p>
              <p>
                <strong>Address:</strong>
                <input
                  type="text"
                  name="address"
                  value={selectedItem.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </p>
              <p>
                <strong>Memo:</strong>
                <input
                  type="text"
                  name="memo"
                  value={selectedItem.memo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </p>
            </div>
          )}

          <button onClick={handleModify}>
            {isEditing ? 'Save' : 'Modify'}
          </button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default List;
