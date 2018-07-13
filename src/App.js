import React from 'react';
import * as querystring from 'querystring';
import {Card, Progress, Avatar, Divider, Row, Col, Spin, message, Collapse, List, Layout, Menu, Icon} from 'antd';
import {library as FALibrary} from '@fortawesome/fontawesome-svg-core';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import './App.css';

const {Content, Footer, Sider} = Layout;

FALibrary.add(fas, fab);

export default class App extends React.Component {

    state = {
        users: [],
        user: null,
        userId: null,
        isLoading: false,
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.state.userId !== nextState.userId) {
            this.setState({isLoading: true});
            const qs = querystring.stringify({id: nextState.userId});
            fetch('/api/users' + (qs.length > 0 ? '?' + qs : ''))
                .then(response => response.json())
                .then((json) => this.setState({user: json, isLoading: false}))
                .catch(error => {
                    this.setState({isLoading: false});
                    message.error('Non sono riuscito a recuperare i dati dell\'utente ' + nextState.userId);
                    console.log('Non sono riuscito a recuperare i dati dell\'utente ' + nextState.userId);
                    console.error(error);
                });
        }
        return true;
    }

    componentDidMount() {
        this.setState({isLoading: true});
        fetch('/api/users')
            .then(response => response.json())
            .then((json) => this.setState({users: json, isLoading: false}))
            .catch(error => {
                this.setState({isLoading: false});
                message.error('Non sono riuscito a recuperare i dati degli utenti');
                console.log('Non sono riuscito a recuperare i dati degli utenti');
                console.error(error);
            });
    }

    setUserId = (userId) => {
        return () => {
            this.setState({userId});
        };
    };

    renderItem = (r) => {

        const title = (<span><FontAwesomeIcon icon="university" style={{marginRight: 8}}/>{r.ambito}</span>);

        return (<List.Item className="dettaglio"><Card title={title}>
            <span><FontAwesomeIcon icon="industry" style={{marginRight: 8}}/>{r.azienda}</span><br />
            <span><FontAwesomeIcon icon="suitcase" style={{marginRight: 8}}/>{r.professione}</span><br />
            <span><FontAwesomeIcon icon="hourglass-half" style={{marginRight: 8}}/>{r.ore}h</span><br />
            </Card></List.Item>);
    };

    render() {
        const {user, users, isLoading} = this.state;

        const IconText = ({type, fa, text}) => {
            if (fa) {
                return <span><FontAwesomeIcon icon={fa} style={{marginRight: 8}}/>{text}</span>;
            } else {
                return <span><Icon type={type} style={{marginRight: 8}}/>{text}</span>;
            }
        };

        const dettaglioUtente = (user) => (
            <React.Fragment>
                <Row gutter={32} style={{marginBottom: 10}}>
                    <Col span={8} offset={8} style={{textAlign: 'center'}}>
                        <Avatar id="avatar" shape="circle" size="large" src={'/avatar/' + user.avatar}/>
                    </Col>
                </Row>
                <Row gutter={32} style={{marginBottom: 10}}>
                    <Col span={12} className="alignLeft">
                        <IconText fa="user" text={'Nome: ' + user.nome + ' ' + user.cognome}/><br/>
                        <IconText fa="birthday-cake" text={'Data di Nascita: ' + user.dataNascita}/><br/>
                        <IconText fa="hourglass-half" text={'Monte ore: ' + user.monteOreASL}/><br/>
                        <Divider/>
                        <IconText fa="school" text={'Istituto: ' + user.scuola}/><br/>
                        <IconText fa="barcode" text={'Codice: ' + user.scuolaCM}/><br/>
                        <IconText fa="map-marker-alt" text={'Indirizzo: ' + user.indirizzo}/><br/>
                        <IconText fa="building" text={'Città: ' + user.cittaScuola}/><br/>
                        <Divider/>
                    </Col>
                    <Col span={12}>
                        {user.ambitiASL.map((a, i) => {
                            const perc = a.ore / user.monteOreASL * 100;
                            return <div className="badge-container" key={'prof' + i}>
                                <div className="badge">
                                    <img src={'/badge/' + a.immagine} alt="professione"/>
                                    <Progress type="circle" percent={perc} showInfo={false}/>
                                </div>
                                <div className="title">{a.professione} {perc}% ({a.ore}h)</div>
                            </div>;
                        })}
                    </Col>
                </Row>
                <Row gutter={32} style={{marginBottom: 10}}>
                    <Collapse bordered={false}>
                        <Collapse.Panel showArrow={false} header="Dettaglio attività svolte" key="collapsedPanel">
                            <List
                                grid={{ gutter: 16, column: 4 }}
                                itemLayout="horizontal"
                                dataSource={user.ambitiASL}
                                renderItem={this.renderItem} />
                        </Collapse.Panel>
                    </Collapse>
                </Row>
            </React.Fragment>
        );

        const noUtente = (
            <React.Fragment>
                Seleziona uno studente dall'elenco a sinistra!
            </React.Fragment>
        );

        return (
            <Layout>
                <Sider width={250} style={{overflow: 'auto', height: '100vh', left: 0}}>
                    <div className="logo">
                        <img src="/logo.png" alt="logo"/>
                    </div>
                    <Menu theme="dark">
                        {users.length > 0 ?
                            <Menu.Item className="classe" key="classe" disabled>Classe 5F</Menu.Item> : null}
                        {users.length > 0 ? users.map((u) => {
                                return (<Menu.Item key={u._id}>
                                    <a onClick={this.setUserId(u._id)}>
                                        <Icon type="user"/>
                                        <span className="nav-text">{u.nome} {u.cognome}</span>
                                    </a>
                                </Menu.Item>);
                            }) :
                            <Menu.Item key="none">
                                <Icon type="warning"/>
                                <span className="nav-text">Nessun studente in db!</span>
                            </Menu.Item>}
                    </Menu>
                </Sider>
                <Layout>
                    <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                        <div style={{padding: 24, background: '#fff', textAlign: 'center'}}>
                            {isLoading ? <Spin size="large"/> : user ? dettaglioUtente(user) : noUtente}
                        </div>
                    </Content>
                    <Footer id="footer">
                        The Blenders - 2018 - Made with <FontAwesomeIcon icon="heart"/>
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}
