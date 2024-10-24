module.exports = (data,keys)=>{
    for(let key of keys){
        if(data[key]==undefined){
            return null;
        }
    }
    return true;
}