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
    permit:number
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
    other:number,
    total:number,
    year:string
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
    clockin:string|null,
    clockout:string|null
}

export type digit = string|number

export interface calendar{
    [key:number]:{[key:number]:{
        status:number,
        comment:string
    }}
}