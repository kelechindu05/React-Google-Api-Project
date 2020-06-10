import React from 'react';
import './App.css';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"

import usePlacesAutoComplete, {
  getGeoCode,
  getLatLng,
} from "use-places-autocomplete"
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption
} from "@reach/combobox";
import "@reach/combobox";
import {formatRelative } from "date-fns"
//import mapStyles from "./mapStyles";








const libraries =  ["places"];
const mapContainerStyle = {  // Set the height and width of the map
  width: "100vw",
  height: "100vh",
}
const center = {
  lat: 6.524379,
  lng: 3.379206,
}
const options = {
 // styles: mapStyles,
  disableDefaultUI: true,
  zoomControl : true
}

export default function App(){

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey : process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const onMapClick = React.useCallback((event) => {
  //console.log(event);
  setMarkers(current => [
    ...current, 
    {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
    time: new Date(),
    }
   ])
  }, []);

   const mapRef = React.useRef();
   const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

   if(loadError) return "Error loading maps";
   if(!isLoaded) return "Loading Maps"


  return <div>
  <h1>Hospital Search</h1>
  <Search />

  <GoogleMap 
  mapContainerStyle = {mapContainerStyle} 
  zoom ={8} 
  center ={center} 
  options = {options}
  onClick = {onMapClick}
  onLoad= {onMapLoad}
  
  >
    {markers.map(marker => <Marker key={marker.time.toISOString()} 
    position={{lat: marker.lat, lng: marker.lng}}
    onClick = {() => {
      setSelected(marker);
    }}
    />
    )}

    {selected ? (<InfoWindow position={{lat: selected.lat, lng: selected.lng}} 
    onCloseClick= {() => {
      setSelected(null);
    }}>
      <div>
        <h2>Location details</h2>
    <p>{formatRelative(selected.time, new Date())}</p>
      </div>
    </InfoWindow>) : null}
  </GoogleMap>
 </div>



}

function Search(){
  const {
    ready, 
    value, 
    suggestions: {status, data}, 
    setValue, clearSuggestion,
    } = 
    usePlacesAutoComplete({
    requestOptions:{
      location:{lat: ()=> 6.524379, lng: () => 3.379206},
      radius: 100 * 1000,
    },
  });
  return (
    <div className="search">
        <Combobox onSelect={(address) => {console.log(address)}}>

          <ComboboxInput value ={value} onChange={(e) =>{
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder = "Enter a Location"
          />
        <ComboboxPopover>
           <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
         </Combobox>
   </div>
  )

}
