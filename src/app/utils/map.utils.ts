import * as L from 'leaflet';
export class MapUtils{
    static cleanGeometry(geo:any){
        if(!geo) return null;
        return{
            type:geo.type,
            coordinates:geo.coordinates
        };
    }
    static getFirstCoordinates(geometry:any):[number,number]{
        const coords=geometry.type==='Point' 
            ? geometry.coordinates
            :geometry.coordinates[0][0];
            return [coords[0],coords[1]];
    }
    static getDrawControl(drawnItems:L.FeatureGroup):L.Control.Draw{
        return new L.Control.Draw({
            edit:{featureGroup:drawnItems},
            draw:{
                polygon:{allowIntersection:true,showArea:true,shapeOptions:{color:'#3388ff'}},
                rectangle:{shapeOptions:{color:'#3388ff'}},
                polyline:false,circle:false,marker:false,circlemarker:false
            }
        });
    }
}