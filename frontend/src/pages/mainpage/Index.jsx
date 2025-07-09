import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar"; // เพิ่ม import Sidebar


export default function MainPage() {
  const [homes, setHomes] = useState([]);
  const navigate = useNavigate();
  const { home_id } = useParams();

  useEffect(() => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => {
        setHomes(res.data);
      })
      .catch(() => setHomes([]));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Row className="mt-4" xs={1} md={3} style={{ gap: "120px", justifyContent: "center" }}>
          {homes.length === 0 && (
            <div style={{ textAlign: "center", width: "100%" }}>ไม่พบข้อมูลบ้านพัก</div>
          )}
          {homes.map((home) => (
            <Col key={home.home_id}>
              <Card style={{ width: '20rem' }}>
                <Card.Img
                  variant="top"
                  src={
                    home.image
                      ? `http://localhost:3001/uploads/${home.image}`
                      : "/img/house-default.png"
                  }
                  alt="home"
                  style={{ width: "100%", height: 200, objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{home.hType}</Card.Title>
                  <Card.Text>
                    <div>หมายเลขบ้าน : {home.Address}</div>
                    <div>
                      สถานะ: <span style={{ color: "#0ea5e9" }}>{home.status}</span>
                    </div>
                  </Card.Text>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button variant="outline-primary" onClick={() => navigate(`/addguest/${home.home_id}`)}>เพิ่มเข้าพัก</Button>
                    <Button variant="primary" onClick={() => navigate(`/guestview/${home.home_id}`)}>
                      รายละเอียด
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}