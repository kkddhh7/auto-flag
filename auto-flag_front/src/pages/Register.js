import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OpenAI } from 'openai';
import config from "../Apikeys.js";

function Register() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [memo, setMemo] = useState('');

    const GOOGLE_CLOUD_VISION_API_KEY = config.GOOGLE_CLOUD_VISION_API_KEY;
    const GOOGLE_CLOUD_GEOCODING_API_KEY = config.GOOGLE_CLOUD_GEOCODING_API_KEY;
    const OPENAI_API_KEY = config. OPENAI_API_KEY;

    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_CLOUD_GEOCODING_API_KEY}`;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (address) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK') {
                    const { lat, lng } = results[0].geometry.location;
                    setLatitude(lat().toString());
                    setLongitude(lng().toString());
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }, [address]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = reader.result.split(',')[1];

            const requestPayload = {
                requests: [
                    {
                        image: {
                            content: base64String,
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                            },
                        ],
                    },
                ],
            };

            try {
                const response = await axios.post(
                    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
                    requestPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.data.responses[0].textAnnotations) {
                    const detections = response.data.responses[0].textAnnotations;
                    const detectedText = detections[0] ? detections[0].description : 'No text detected';
                    const cleanedText = detectedText.replace(/\n/g, ' ');
                    const extractedAddress = await extractAddress(cleanedText);
                    setAddress(extractedAddress);
                } else {
                    console.error('No text annotations found');
                }
            } catch (error) {
                console.error('Failed to fetch text from image', error);
            }
        };
    };

    const extractAddress = async (text) => {
        let modifiedText = text.replace(/(?:시|도|군|구|로|길|대로|층)(?!\s)/g, '$& ');

        try {
            const gptResponse = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '텍스트가 주어질 것이다. 거기서 주소만을 한글로 출력하라.',
                    },
                    {
                        role: 'user',
                        content: modifiedText,
                    },
                ],
            });

            const extractedAddress = gptResponse.choices[0].message.content.trim();
            return extractedAddress;
        } catch (error) {
            console.error('Failed to extract address using GPT', error);
            return 'Address not found';
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Image:', image);
        console.log('Address:', address);
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Memo:', memo);
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setAddress('');
        setLatitude('');
        setLongitude('');
        setMemo('');
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Image:
                    <input type="file" onChange={handleImageChange} />
                </label>
                <br />
                {preview && (
                    <div>
                        <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
                    </div>
                )}
                <label>
                    Address:
                    <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
                <br />
                <label>
                    Latitude:
                    <input type="text" value={latitude} readOnly />
                </label>
                <br />
                <label>
                    Longitude:
                    <input type="text" value={longitude} readOnly />
                </label>
                <br />
                <label>
                    Memo:
                    <input type="text" value={memo} readOnly />
                </label>
                <br />
                <button type="submit">Submit</button>
                <button type="button" onClick={handleReset}>Reset</button>
            </form>
        </div>
    );
}

export default Register;
