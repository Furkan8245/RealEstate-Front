import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name:'areaFormat',
    standalone:true
})
export class AreaFormatPipe implements PipeTransform{
    transform(value: number| string,unit:string='m²'):string {
        if (value===null||value===undefined) return '';
        const areaValue = typeof value ==='string'?parseFloat(value):value;

        const formattedValue = new Intl.NumberFormat('tr-TR',{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }).format(areaValue);
        return `${formattedValue} ${unit}`;
    }
}