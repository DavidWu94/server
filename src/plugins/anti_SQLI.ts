export function sqli_detect(querys:{[key:string]:any}):boolean{
    for(let query of Object.values(querys)){
        if(typeof query!=="string") continue;
        if(query.toLowerCase().match(/(select)|(where)|(\>)|(\<)|(=)|(')/)!=null){
            return true;
        }
    }
    return false;
}