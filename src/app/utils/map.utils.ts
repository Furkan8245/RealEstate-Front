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
}