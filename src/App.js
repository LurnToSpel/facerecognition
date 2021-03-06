import React, { Component } from 'react'
import Particles from 'react-particles-js'
import axios from 'axios'

import Navigation from './components/Navigation'
import Signin from './components/Signin'
import Register from './components/Register'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Rank from './components/Rank'
import './App.css'

// const url =
//   process.env.NODE_ENV === 'production'
//     ? 'https://face-off-api.herokuapp.com'
//     : 'http://localhost:3000'
const url = 'https://face-off-api.herokuapp.com'

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800,
      },
    },
  },
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
}
class App extends Component {
  constructor() {
    super()
    this.state = initialState
  }

  calculateFaceLocation = data => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    }
  }

  displayFaceBox = box => {
    this.setState({ box })
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  onPictureSubmit = async () => {
    this.setState({ imageUrl: this.state.input })
    try {
      const { data } = await axios.post(`${url}/imageurl`, {
        input: this.state.input,
      })
      if (data) {
        const entries = await axios.put(`${url}/image`, { id: this.state.user.id })
        this.setState(Object.assign(this.state.user, { entries: entries.data }))
      }
      this.displayFaceBox(this.calculateFaceLocation(data))
    } catch (error) {
      console.error(error)
    }
  }

  onRouteChange = route => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route })
  }

  loadUser = data => {
    this.setState({
      user: { ...data },
    })
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        {route === 'home' ? (
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onChange={this.onChange} onPictureSubmit={this.onPictureSubmit} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === 'signin' ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} url={url} />
        ) : (
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} url={url} />
        )}
      </div>
    )
  }
}

export default App
