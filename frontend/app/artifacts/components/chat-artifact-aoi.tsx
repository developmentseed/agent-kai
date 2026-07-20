import { Flex } from '@chakra-ui/react';
import Map, {
  Layer,
  LngLatBoundsLike,
  Marker,
  Source
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import bbox from '@turf/bbox';

import { Artifact } from '$components/chat-artifact';
import { ArtifactAOI as IArtifactAOI } from '../config';

export function ArtifactAOI({ data }: { data: IArtifactAOI }) {
  return (
    <Artifact title={`AOI: ${data.properties?.name}`}>
      <Flex m={-4} minH='20rem' flex={1}>
        <FeatureMap feature={data} />
      </Flex>
    </Artifact>
  );
}

export function FeatureMap({ feature }: { feature: GeoJSON.Feature }) {
  return (
    <Map
      initialViewState={{
        longitude: 4.3594,
        latitude: 50.854,
        zoom: 3
      }}
      // Ensure that users don't zoom in beyond the data resolution, which
      // is 5km.
      maxZoom={9.5}
      mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
      onLoad={(e) => {
        e.target.fitBounds(bbox(feature) as LngLatBoundsLike, { padding: 20 });
      }}
    >
      {feature.geometry.type === 'Point' ? (
        <Marker
          longitude={feature.geometry.coordinates[0]}
          latitude={feature.geometry.coordinates[1]}
        />
      ) : (
        <Source type='geojson' data={feature}>
          <Layer
            type='fill'
            paint={{ 'fill-color': '#888', 'fill-opacity': 0.5 }}
          />
        </Source>
      )}
    </Map>
  );
}
