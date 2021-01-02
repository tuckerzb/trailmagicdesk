import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';

const Footer = () => {
    return (
        <footer>
           <Container>
               <Row>
                   <Col className='text-center py-3'>
                     Copyright &copy; Trail Magic Desk | Website by <a href='http://www.bytarmacortrail.com'>Zach "Free Fall" Tucker</a>
                   </Col>
               </Row>
           </Container>
        </footer>
    )
}

export default Footer;