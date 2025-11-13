interface systemReturn{
    status:number,
    data:any|undefined
}

export interface table{}

export interface userinfo extends table{
    id:string,
    pwd:string,
    type:string,
    email:string,
    name:string,
    joinTime:string, 
    mgroup:number,
    permit:number,
    status:number
}

export interface logininfo extends table{
    id:string,
    sKey:string,
    createTime:string
}

export interface dayoffinfo extends table{
    id:string,
    annual:number,
    personal:number,
    care:number,
    sick:number,
    wedding:number,
    funeral:number,
    birth:number,
    pcheckup:number,
    miscarriage:number,
    paternity:number,
    maternity:number,
    official:number,
    typhoon:number,
    other:number,
    total:number,
    year:string
}

export interface dayoffinfo_ret{
    separate:boolean,
    data:Array<dayoffinfo>
}

export interface requestquery extends table{
    serialnum:string,
    id:string,
    name:string,
    type:string,
    start:string,
    end:string,
    mgroup:number,
    state:number,
    year:string,
    month:string,
    totalTime:number,
    reason:string
}

export interface clockinrecord extends table{
    id:string,
    name:string,
    date:string,
    num:number,
    clockin:string|null,
    clockout:string|null
}

export type digit = string|number

export interface calendar{
    [key:string]:{[key:string]:{
        status:number,
        comment:string
    }}
}

export type dayofftype = {
    "特休假":"annual",
    "事假":"personal",
    "家庭照顧假":"care",
    "病假":"sick",
    "婚假":"wedding",
    "喪假":"funeral",
    "分娩假":"birth",
    "產檢假":"pcheckup",
    "流產假":"miscarriage",
    "陪產假":"paternity",
    "產假":"maternity",
    "公假":"official",
    "停班停課":"typhoon",
    "其他":"other"
}

export type shortdayoff = {
    "事假":"事",
    "家庭照顧假":"家",
    "病假":"病",
    "婚假":"婚",
    "喪假":"喪",
    "分娩假":"娩",
    "產檢假":"檢",
    "流產假":"流",
    "陪產假":"陪",
    "產假":"產",
    "公假":"公",
    "停班停課":"停",
    "其他":"其",
}