import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Image, Linking} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const CLIENT_ID = '52844340c385474b8d228813bfc84a2f';

export default class App extends Component {
  state = {
    userInfo: null,
    didError: false
  };

  handleSpotifyLogin = async () => {
    let redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
    // console.log(redirectUrl);

    let results = await AuthSession.startAsync({
      authUrl: `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user-read-email&response_type=token`
    });

    if (results.type !== 'success') {
      this.setState({ didError: true });
    } 
    else {
      const userInfo = await axios.get(`https://api.spotify.com/v1/me`, {
        headers: {
          "Authorization": `Bearer ${results.params.access_token}`
        }
      });

      this.setState({ userInfo: userInfo.data });
    }
  };

  displayError = () => {
    return (
      <View style={styles.userInfo}>
        <Text style={styles.errorText}>There was an error, please try again.</Text>
      </View>
    );
  }

  displayResults = () => {
    let uri = this.state.userInfo && this.state.userInfo.images.length ? 
      this.state.userInfo.images[0].url : 'https://reactnative.dev/img/tiny_logo.png';

    { 
      return this.state.userInfo ? (
        <View style={styles.userInfo}>
          <Image style={styles.profileImage} source={ {'uri': uri} } />

          <View>
            <Text style={styles.userInfoText}>Name: {this.state.userInfo.display_name}</Text>
            <Text style={styles.userInfoText}>Email: {this.state.userInfo.email}</Text>
            <Text style={styles.userInfoLink} onPress={() => Linking.openURL(this.state.userInfo.external_urls.spotify)}>View Profile</Text>
          </View>
        </View>
      ) : (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Login to Spotify to view user profile</Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FontAwesome name="spotify" color="#2FD566" size={128} />

        <TouchableOpacity style={styles.button} onPress={this.handleSpotifyLogin} disabled={this.state.userInfo ? true : false}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {this.state.didError ? this.displayError() : this.displayResults()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#000',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  button: {
    backgroundColor: '#2FD566',
    padding: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
  },
  userInfo: {
    height: 200,
    width: 400,
    alignItems: 'center',
  },
  userInfoText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  profileImage: {
    height: 64,
    width: 64,
    marginBottom: 32,
  },
  userInfoLink: {
    color: 'blue',
    fontSize: 18,
  }
});

// expo init my-app
// expo install axios
// expo install expo-auth-session expo-random
// https://developer.spotify.com/dashboard/
// https://developer.spotify.com/documentation/general/guides/scopes/
// https://docs.expo.io/versions/latest/sdk/auth-session/
