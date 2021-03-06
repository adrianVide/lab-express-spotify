require("dotenv").config();

const express = require("express");
const hbs = require("hbs");
const SpotifyWebApi = require("spotify-web-api-node");

// require spotify-web-api-node package here:

const app = express();

hbs.registerPartials(__dirname + "/views/partials");
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:3000",
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/artist-search", (req, res, next) => {
  spotifyApi
    .searchArtists(req.query.artist)
    // console.log(req.query.artist)
    .then((data) => {
      let artItems = data.body.artists.items;
      // console.log("The received data from the API: ", artItems);
      res.render("artist-search", { artItems });

      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    })

    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

// app.get("/albums-search/:id", (req, res, next) => {
//   spotifyApi
//     .getArtistAlbums(req.params.id)
//     .then(data => {
//       console.log(data);
//       let alItems = data[0].body.albums.items;
//       console.log("The received data from the API: ", alItems);
//       res.render("album-search", {alItems});

//       // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
//     })
//     .catch(err =>
//       console.log("The error while searching artists occurred: ", err)
//     );
// });

app.get("/album-search/:id", (req, res) => {
  spotifyApi
    .getArtistAlbums(req.params.id)
    .then((albums) => {
      alItems = albums.body.items;
      //  console.log(alItems);
      spotifyApi.getArtist(req.params.id).then((artist) => {
        // console.log(artist.body.name);
        artistName = artist.body.name;
        res.render("album-search", { alItems, artistName });
      });
    })
    .catch((error) => console.log(error));
});

app.get("/track/:id", async (req, res) => {
  let tracks;
  let album;
  let artist;
  await spotifyApi.getAlbumTracks(req.params.id).then((albumTracks) => {
    tracks = albumTracks.body.items;
  });
  await spotifyApi.getAlbum(req.params.id).then((albumName) => {
    album = albumName.body.name;
  });
  await spotifyApi.getAlbum(req.params.id).then((artistName) => {
    artist = artistName.body.artists;
  });

  res.render("tracks", { tracks, album, artist });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
