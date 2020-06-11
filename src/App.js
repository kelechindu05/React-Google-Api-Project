import React from 'react';
import './App.css';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"

import usePlacesAutoComplete, {
  getGeocode,
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
  //styles: mapStyles,
  disableDefaultUI: true,
  zoomControl : true
}

export default function App(){

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey : "AIzaSyB8YRUt48VKR_nLWI6s7oF9ppu_6uuiHm0", //process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
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

  const panTo = React.useCallback(({lat, lng}) => {
    mapRef.current.panTo({lat, lng});
    mapRef.current.setZoom(20);
    //api function to get nearby places using lat long 

  }, [])
   if(loadError) return "Error loading maps";
   if(!isLoaded) return "Loading Maps"


  return <div>
  <h1>Hospital Search</h1>
  <Locate panTo={panTo} />
  <Search panTo={panTo} />

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
function Locate ({panTo}){
  return <button className="locate"
  className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
  
  ><img src="/compass.svg" alt="compass- locate me"/></button>
}

function Search(){
  const {
    ready, 
    value, 
    suggestions: {status, data}, 
    setValue, 
    clearSuggestion,
    } = 
    usePlacesAutoComplete({
    requestOptions:{
      location:{lat: ()=> 6.524379, lng: () => 3.379206},
      radius: 20 * 1000,
    },
  });
  return (
    <div className="search">
      <Combobox onSelect={async (address) =>{
        try{
          const results = await getGeocode({address});
          console.log(results[0])
        }catch(error){
          console.log(address);
        }

        
      }}
      >

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
