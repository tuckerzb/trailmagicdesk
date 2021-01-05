import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {LinkContainer} from 'react-router-bootstrap';
import {Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import {logout} from '../actions/userActions';

const Header = ({history}) => {
    const dispatch = useDispatch();
    
    const userLogin = useSelector(state => state.userLogin);
    const {userInfo} = userLogin;

    const logoutHandler = () => {
        dispatch(logout());
    };

    return (
        <header>
           <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <LinkContainer to='/'>
                    <Navbar.Brand>Trail Magic From Your Desk</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <LinkContainer to ='/cart'>
                            <Nav.Link><i className="fas fa-shopping-cart">Cart</i></Nav.Link>
                        </LinkContainer>
                        {userInfo && userInfo.isAdmin && (
                            <NavDropdown title='Admin' id='adminMenu'>
                            <LinkContainer to='/admin/userList'>
                                <NavDropdown.Item>Users</NavDropdown.Item>
                            </LinkContainer>
                            <LinkContainer to='/admin/productList'>
                                <NavDropdown.Item>Products</NavDropdown.Item>
                            </LinkContainer>
                            <LinkContainer to='/admin/orderList'>
                                <NavDropdown.Item>Orders</NavDropdown.Item>
                            </LinkContainer>
                            <NavDropdown.Item onClick={logoutHandler}>
                                    Logout
                                </NavDropdown.Item>
                        </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
        </header>
    )
}

export default Header;
