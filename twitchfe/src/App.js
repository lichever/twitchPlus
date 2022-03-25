import React from 'react';
import { Button, Col, Layout, Menu, message, Row, Switch } from 'antd';
import Login from './components/Login';
import Register from './components/Register';
import { getFavoriteItem, getRecommendations, getTopGames, logout, searchGameById } from './utils';
import Favorites from './components/Favorites';
import { LikeOutlined, FireOutlined } from '@ant-design/icons';
import CustomSearch from './components/CustomSearch';
import SubMenu from 'antd/lib/menu/SubMenu';
import Home from './components/Home';

const { Header, Content, Sider } = Layout;

class App extends React.Component {
  state = {
    loggedIn: false,
    topGames: [],
    resources: {
      VIDEO: [],
      STREAM: [],
      CLIP: [],
    },
    favoriteItems: {
      VIDEO: [],
      STREAM: [],
      CLIP: [],
    },
  }

  favoriteOnChange = () => {
    getFavoriteItem().then((data) => {
      this.setState({
        favoriteItems: data,
      })
    }).catch((err) => {
      message.error(err.message);
    })
  }

  onGameSelect = ({ key }) => {
    // sidebar 2种情况 Recommendations or 点击了下面的某个 topgame
    // 注意key === 'Recommendation' 和 下面的 第三方api返回的gameId 区分开
    //输入参数格式是{ key },是因为antd api 规定 function({ item, key, keyPath, selectedKeys, domEvent })
    if (key === 'Recommendation') {
      getRecommendations().then((data) => {
        this.setState({
          resources: data,
        })
      })

      return;
    }

    searchGameById(key).then((data) => {
      this.setState({
        resources: data,
      })
    })
  }

  customSearchOnSuccess = (data) => {
    this.setState({
      resources: data,
    })
  }

  signinOnSuccess = () => {
    getFavoriteItem().then((data) => {
      this.setState({
        favoriteItems: data,
        loggedIn: true
      })
    }).catch((err) => {
      message.error(err.message);
    })
  }

  signoutOnClick = () => {
    logout()
      .then(() => {
        this.setState({
          loggedIn: false
        })
        message.success(`Successfull signed out`);
      }).catch((err) => {
        message.error(err.message);
      })
  }

  //这里不像favorite数据需要login，topgame的数据直接拉
  componentDidMount = () => {
    getTopGames()
      .then((data) => {
        this.setState({
          topGames: data
        })
      })
      .catch((err) => {
        message.error(err.message);
      })
  }


  render = () => (
    <Layout>
      <Header>
        <Row justify="space-between">
          <Col>
          {/* comment inside JSX, below is the JS expression*/}
            { 
              this.state.loggedIn &&
              <Favorites data={this.state.favoriteItems} />
            }
          </Col>

          <Col>
            <div className='title'> Twitch+ Personal Recommendation Engine</div>
          </Col>

          <Col>
            {
              this.state.loggedIn ?
                <Button shape="round" onClick={this.signoutOnClick}>
                  Logout</Button> :
                (
                  <>
                    <Login onSuccess={this.signinOnSuccess} />
                    <Register />
                  </>
                )
            }

          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider width={300} className="site-layout-background">
          {/* 通常都是app的setState 传到下面的component让其拉数据 改状态 UI局部更新 */}
          <CustomSearch onSuccess={this.customSearchOnSuccess} />
          <Menu
            mode="inline"
            onSelect={this.onGameSelect}
            style={{ marginTop: '10px' }}
          >
            {/* 注意这里 key="Recommendation" 是和后端约定好了的 key  */}
            <Menu.Item icon={<LikeOutlined />} key="Recommendation">
              Recommend for you!</Menu.Item>

            <SubMenu icon={<FireOutlined />} key="Popular Games" title="Popular Games" className="site-top-game-list" >
              {
                this.state.topGames.map((game) => {
                  return (
                    <Menu.Item key={game.id} style={{ height: '50px' }}>
                      <img
                        alt="Placeholder"
                        src={game.box_art_url.replace('{height}', '40').replace('{width}', '40')}
                        style={{ borderRadius: '50%', marginRight: '20px' }}
                      />
                      <span>
                        {game.name}
                      </span>
                    </Menu.Item>
                  )
                })
              }
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              overflow: 'auto'
            }}
          >
            <Home
              resources={this.state.resources}
              loggedIn={this.state.loggedIn}
              favoriteItems={this.state.favoriteItems}
              favoriteOnChange={this.favoriteOnChange}
            />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App;
