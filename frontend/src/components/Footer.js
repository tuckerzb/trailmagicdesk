import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';

const Footer = () => {
    return (
        <footer>
           <Container>
               <Row>
                   <Col className='text-center py-3'>
                     Copyright &copy;2021 Trail Magic Desk | Website by <a href='https://zachtucker.dev'>Zach "Free Fall" Tucker</a>
                   </Col>
               </Row>
           </Container>
        </footer>
    )
}

export default Footer;
