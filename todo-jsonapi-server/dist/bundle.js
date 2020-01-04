'use strict';

const srcmap = require('source-map-support').install({
  environment: 'node'
});

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var chalk = require('chalk');
var chalk__default = _interopDefault(chalk);
var os = require('os');
var cluster = require('cluster');
var tty = require('tty');
var ansiRegex = _interopDefault(require('ansi-regex'));
var http = require('http');
var url = require('url');
var inflection = require('inflection');
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var fs__default = _interopDefault(fs);
var EventEmitter = _interopDefault(require('events'));
require('fb-watchman');
require('child_process');
var faker = _interopDefault(require('faker'));

const VALID_DRIVERS=['pg','sqlite3','mssql','mysql','mysql2','mariasql','strong-oracle','oracle'];const TYPE_ALIASES=new Map([['enu','array'],['enum','array'],['json','object'],['jsonb','object'],['binary','buffer'],['bool','boolean'],['boolean','boolean'],['time','date'],['date','date'],['datetime','date'],['text','string'],['uuid','string'],['string','string'],['varchar','string'],['int','number'],['float','number'],['integer','number'],['decimal','number'],['floating','number'],['bigInteger','number']]);

const {env:ENV}=process;function getPID(){let{pid}=process;if(cluster.isWorker&&typeof cluster.worker.pid==='number'){pid=cluster.worker.pid;}return pid}const CWD=process.cwd();const PID=getPID();const NODE_ENV=ENV.NODE_ENV||'development';const DATABASE_URL=ENV.DATABASE_URL;const LUX_CONSOLE=ENV.LUX_CONSOLE||false;const PLATFORM=os.platform();

function K(){return this}

const FREEZER=new WeakSet;

function insert(target,items){for(let i=0;i<items.length;i+=1){target.splice(i,1,items[i]);}return target}

function isObject(value){return Boolean(value)&&typeof value==='object'&&!Array.isArray(value)}

function freeze(value){FREEZER.add(value);return value}function freezeArray(target){const result=insert(new Array(target.length),target);return Object.freeze(result)}function freezeValue(value){if(value&&typeof value.freeze==='function'){return Object.freeze(value).freeze(true)}else if(isObject(value)){return Object.freeze(value)}return value}function freezeProps(target,makePublic,...props){Object.defineProperties(target,props.reduce((obj,key)=>Object.assign({},obj,{[key]:{value:Reflect.get(target,key),writable:false,enumerable:makePublic,configurable:false}}),{}));return target}function deepFreezeProps(target,makePublic,...props){Object.defineProperties(target,props.reduce((obj,key)=>{let value=Reflect.get(target,key);if(Array.isArray(value)){value=freezeArray(value);}else{value=freezeValue(value);}return Object.assign({},obj,{[key]:{value,writable:false,enumerable:makePublic,configurable:false}})},{}));return target}

function isFrozen(value){return FREEZER.has(value)}

class FreezeableMap extends Map{set(key,value){if(!this.isFrozen()){super.set(key,value);}return this}clear(){if(!this.isFrozen()){super.clear();}}delete(key){return this.isFrozen()?false:super.delete(key)}freeze(deep){if(deep){this.forEach(Object.freeze);}return freeze(this)}isFrozen(){return isFrozen(this)}}

class FreezeableSet extends Set{add(value){if(!this.isFrozen()){super.add(value);}return this}clear(){if(!this.isFrozen()){super.clear();}}delete(value){return this.isFrozen()?false:super.delete(value)}freeze(deep){if(deep){this.forEach(Object.freeze);}return freeze(this)}isFrozen(){return isFrozen(this)}}

const DEBUG='DEBUG';const INFO='INFO';const WARN='WARN';const ERROR='ERROR';const FORMATS=new FreezeableSet(['text','json']);FORMATS.freeze();const LEVELS=new FreezeableMap([[DEBUG,0],[INFO,1],[WARN,2],[ERROR,3]]);LEVELS.freeze();

const HAS_OBJECT_ENTRIES=typeof Object.entries==='function';function entries(source){if(HAS_OBJECT_ENTRIES){return Object.entries(source)}return Object.keys(source).reduce((result,key)=>{const value=Reflect.get(source,key);result.push([key,value]);return result},[])}

function setType(fn){return fn()}

function omit(src,...omitted){return setType(()=>entries(src).filter(([key])=>omitted.indexOf(key)<0).reduce((result,[key,value])=>Object.assign({},result,{[key]:value}),{}))}

const ANSI=ansiRegex();const STDOUT=/^(DEBUG|INFO)$/;const STDERR=/^(WARN|ERROR)$/;

function stringify(value,spaces){if(isObject(value)||Array.isArray(value)){return JSON.stringify(value,null,spaces)}return String(value)}

function formatMessage(data,format){if(data instanceof Error){return data.stack}else if(format==='json'){return stringify(data).replace(ANSI,'')}return stringify(data,2)}

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve$$1, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve$$1(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};























var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

function createWriter(format){return function write(data){const{level}=data,etc=objectWithoutProperties(data,['level']);let{message,timestamp}=etc;let output;if(format==='json'){output={};if(message&&typeof message==='object'&&message.message){output=Object.assign({timestamp,level,message:message.message},omit(message,'message'));}else{output=Object.assign({timestamp,level,message},etc);}output=formatMessage(output,'json');}else{let columns=0;if(process.stdout instanceof tty.WriteStream){columns=process.stdout.columns;}message=formatMessage(message,'text');switch(level){case WARN:timestamp=chalk.yellow(`[${timestamp}]`);break;case ERROR:timestamp=chalk.red(`[${timestamp}]`);break;default:timestamp=chalk.dim(`[${timestamp}]`);break;}output=`${timestamp} ${message}\n\n${chalk.dim('-').repeat(columns)}\n`;}if(STDOUT.test(level)){process.stdout.write(`${output}\n`);}else if(STDERR.test(level)){process.stderr.write(`${output}\n`);}}}

function insertValues(strings,...values){if(values.length){return strings.reduce((result,part,idx)=>{let value=values[idx];if(value&&typeof value.toString==='function'){value=value.toString();}else{value='';}return result+part+value},'')}return strings.join('')}

function line(strings,...values){return insertValues(strings,...values).replace(/(\r\n|\n|\r|)/gm,'').replace(/\s+/g,' ').trim()}

function countDigits(num){const digits=Math.floor(Math.log10(num)+1);return digits>0&&Number.isFinite(digits)?digits:1}function pad(startTime,endTime,duration){const maxLength=countDigits(endTime-startTime);return' '.repeat(maxLength-countDigits(duration))+duration}const debugTemplate=({path: path$$1,stats,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress})=>`\
${line`
  Processed ${chalk.cyan(`${method}`)} "${path$$1}" from ${remoteAddress}
  with ${Reflect.apply(colorStr,null,[`${statusCode}`])}
  ${Reflect.apply(colorStr,null,[`${statusMessage}`])} by ${route?`${chalk.yellow(route.controller.constructor.name)}#${chalk.blue(route.action)}`:null}
`}

${chalk.magenta('Params')}

${JSON.stringify(params,null,2)}

${chalk.magenta('Stats')}

${stats.map(stat=>{const{type,duration,controller}=stat;let{name}=stat;name=chalk.blue(name);if(type==='action'){name=`${chalk.yellow(controller)}#${name}`;}return`${pad(startTime,endTime,duration)} ms ${name}`}).join('\n')}
${pad(startTime,endTime,stats.reduce((total,{duration})=>total+duration,0))} ms Total
${(endTime-startTime).toString()} ms Actual\
`;const infoTemplate=({path: path$$1,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress})=>line`
Processed ${chalk.cyan(`${method}`)} "${path$$1}" ${chalk.magenta('Params')} ${JSON.stringify(params)} from ${remoteAddress} in ${(endTime-startTime).toString()} ms with ${Reflect.apply(colorStr,null,[`${statusCode}`])} ${Reflect.apply(colorStr,null,[`${statusMessage}`])} by ${route?`${chalk.yellow(route.controller.constructor.name)}#${chalk.blue(route.action)}`:null}
`;

function filterParams(params,...filtered){return entries(params).map(([key,value])=>[key,filtered.indexOf(key)>=0?'[FILTERED]':value]).reduce((result,[key,value])=>Object.assign({},result,{[key]:value&&typeof value==='object'&&!Array.isArray(value)?filterParams(value,...filtered):value}),{})}

function logText(logger,{startTime,request:req,response:res}){res.once('finish',()=>{const endTime=Date.now();const{route,method,url:{path: path$$1},connection:{remoteAddress}}=req;const{stats,statusMessage}=res;let{params}=req;let{statusCode}=res;let statusColor;params=filterParams(params,...logger.filter.params);if(statusCode>=200&&statusCode<400){statusColor='green';}else{statusColor='red';}let colorStr=Reflect.get(chalk__default,statusColor);if(typeof colorStr==='undefined'){colorStr=str=>str;}statusCode=statusCode.toString();const templateData={path: path$$1,stats,route,method,params,colorStr,startTime,endTime,statusCode,statusMessage,remoteAddress};if(logger.level===DEBUG){logger.debug(debugTemplate(templateData));}else{logger.info(infoTemplate(templateData));}});}

const MESSAGE='Processed Request';function logJSON(logger,{request:req,response:res}){res.once('finish',()=>{const{method,headers,httpVersion,url:{path: path$$1},connection:{remoteAddress}}=req;const{statusCode:status}=res;const userAgent=headers.get('user-agent');const protocol=`HTTP/${httpVersion}`;let{params}=req;params=filterParams(params,...logger.filter.params);logger.info({message:MESSAGE,method,path: path$$1,params,status,protocol,userAgent,remoteAddress});});}

function createRequestLogger(logger){return function request(req,res,{startTime}){if(logger.format==='json'){logJSON(logger,{startTime,request:req,response:res});}else{logText(logger,{startTime,request:req,response:res});}}}

const PATTERN=/(?:,?`|'|").+(?:`|'|"),?/;function sql(strings,...values){return insertValues(strings,...values).split(' ').map(part=>{if(PATTERN.test(part)){return part}return part.toUpperCase()}).join(' ')}

class Logger{constructor({level,format,filter,enabled}){let write=K;let request=K;if(!LUX_CONSOLE&&enabled){write=createWriter(format);request=createRequestLogger(this);}Object.defineProperties(this,{level:{value:level,writable:false,enumerable:true,configurable:false},format:{value:format,writable:false,enumerable:true,configurable:false},filter:{value:filter,writable:false,enumerable:true,configurable:false},enabled:{value:Boolean(enabled),writable:false,enumerable:true,configurable:false},request:{value:request,writable:false,enumerable:false,configurable:false}});const levelNum=LEVELS.get(level)||0;LEVELS.forEach((val,key)=>{Reflect.defineProperty(this,key.toLowerCase(),{writable:false,enumerable:false,configurable:false,value:val>=levelNum?message=>{write({message,level:key,timestamp:this.getTimestamp()});}:K});});}getTimestamp(){return new Date().toISOString()}}

class InvalidDriverError extends Error{constructor(driver){super(line`
      Invalid database driver ${chalk.yellow(driver)} in ./config/database.js.
      Please use one of the following database drivers:
      ${VALID_DRIVERS.map(str=>chalk.green(str)).join(', ')}.
    `);}}

class ModelMissingError extends Error{constructor(name){super(`Could not resolve model by name '${name}'`);}}

class MigrationsPendingError extends Error{constructor(migrations=[]){const pending=migrations.map(str=>chalk.yellow(str.substr(0,str.length-3))).join(', ');super(line`
      The following migrations are pending ${pending}.
      Please run ${chalk.green('lux db:migrate')} before starting your application.
    `);}}

function tryCatchSync(fn,rescue=K){let result;try{result=fn();}catch(err){result=rescue(err);}return result}

const HAS_BODY=/^(POST|PATCH)$/;const STATUS_CODES=new Map([[100,'Continue'],[101,'Switching Protocols'],[102,'Processing'],[200,'OK'],[201,'Created'],[202,'Accepted'],[203,'Non-Authoritative Information'],[204,'No Content'],[205,'Reset Content'],[206,'Partial Content'],[207,'Multi-Status'],[208,'Already Reported'],[226,'IM Used'],[300,'Multiple Choices'],[301,'Moved Permanently'],[302,'Found'],[303,'See Other'],[304,'Not Modified'],[305,'Use Proxy'],[307,'Temporary Redirect'],[308,'Permanent Redirect'],[400,'Bad Request'],[401,'Unauthorized'],[402,'Payment Required'],[403,'Forbidden'],[404,'Not Found'],[405,'Method Not Allowed'],[406,'Not Acceptable'],[407,'Proxy Authentication Required'],[408,'Request Timeout'],[409,'Conflict'],[410,'Gone'],[411,'Length Required'],[412,'Precondition Failed'],[413,'Payload Too Large'],[414,'URI Too Long'],[415,'Unsupported Media Type'],[416,'Range Not Satisfiable'],[417,'Expectation Failed'],[418,'I\'m a teapot'],[421,'Misdirected Request'],[422,'Unprocessable Entity'],[423,'Locked'],[424,'Failed Dependency'],[425,'Unordered Collection'],[426,'Upgrade Required'],[428,'Precondition Required'],[429,'Too Many Requests'],[431,'Request Header Fields Too Large'],[451,'Unavailable For Legal Reasons'],[500,'Internal Server Error'],[501,'Not Implemented'],[502,'Bad Gateway'],[503,'Service Unavailable'],[504,'Gateway Timeout'],[505,'HTTP Version Not Supported'],[506,'Variant Also Negotiates'],[507,'Insufficient Storage'],[508,'Loop Detected'],[509,'Bandwidth Limit Exceeded'],[510,'Not Extended'],[511,'Network Authentication Required']]);

const REQUEST_METHODS=['GET','HEAD','POST','PATCH','DELETE','OPTIONS'];

const DELIMITER=/^(.+)\[(.+)]$/g;function parseNestedObject(source){return entries(source).reduce((result,[key,value])=>{if(DELIMITER.test(key)){const parentKey=key.replace(DELIMITER,'$1');const parentValue=Reflect.get(result,parentKey);return Object.assign({},result,{[parentKey]:Object.assign({},parentValue||{},{[key.replace(DELIMITER,'$2')]:value})})}return Object.assign({},result,{[key]:value})},{})}

const INT=/^\d+$/;const NULL=/^null$/;const BOOL=/^(?:true|false)$/;const DATE=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|\+\d{4})$/;const TRUE=/^true$/;const BRACKETS=/(?:\[])/g;

function isNull(value){return value===null}

function underscore$1(source='',upper=false){return inflection.underscore(source,upper).replace(/-/g,'_')}

function transformKeys(source,transformer,deep=false){return setType(()=>{if(Array.isArray(source)){return source.slice(0)}else if(source&&typeof source==='object'){return entries(source).reduce((result,[key,value])=>{const recurse=deep&&value&&typeof value==='object'&&!Array.isArray(value)&&!(value instanceof Date);if(recurse){return Object.assign({},result,{[transformer(key)]:transformKeys(value,transformer,true)})}return Object.assign({},result,{[transformer(key)]:value})},{})}return{}})}function camelizeKeys(source,deep){return transformKeys(source,key=>inflection.camelize(underscore$1(key),true),deep)}function dasherizeKeys(source,deep){return transformKeys(source,key=>inflection.dasherize(underscore$1(key),true),deep)}

function makeArray(source){if(!Array.isArray(source)){return source.includes(',')?source.split(','):[source]}return source}function formatString(source,method){if(method==='GET'){if(source.indexOf(',')>=0){return source.split(',').map(str=>inflection.camelize(underscore$1(str),true))}else if(INT.test(source)){return Number.parseInt(source,10)}else if(BOOL.test(source)){return TRUE.test(source)}else if(NULL.test(source)){return null}}if(DATE.test(source)){return new Date(source)}return source}function formatObject(source,method,formatter){if(Array.isArray(source)){return source.map(value=>{if(INT.test(value)){return Number.parseInt(value,10)}return value})}return formatter(source,method)}function formatSort(sort){if(sort.startsWith('-')){return`-${inflection.camelize(underscore$1(sort.substr(1)),true)}`}return inflection.camelize(underscore$1(sort),true)}function formatFields(fields){return entries(fields).reduce((result,[key,value])=>Object.assign({},result,{[key]:makeArray(value)}),{})}function formatInclude(include){return makeArray(include)}function format(params,method){const result=entries(params).reduce((obj,param)=>{const[,value]=param;let[key]=param;key=key.replace(BRACKETS,'');switch(typeof value){case'object':return Object.assign({},obj,{[key]:isNull(value)?null:formatObject(value,method,format)});case'string':return Object.assign({},obj,{[key]:formatString(value,key==='id'?'GET':method)});default:return Object.assign({},obj,{[key]:value});}},{});return camelizeKeys(result,true)}

function parseRead({method,url:{query}}){const _parseNestedObject=parseNestedObject(query),{sort,fields,include}=_parseNestedObject,params=objectWithoutProperties(_parseNestedObject,['sort','fields','include']);if(sort){params.sort=typeof sort==='string'?formatSort(sort):sort;}if(fields){params.fields=isObject(fields)?formatFields(fields):fields;}if(include){params.include=formatInclude(include);}return format(params,method)}

function createServerError(Target,statusCode){return setType(()=>{const ServerError=class ServerError extends Target{constructor(...args){super(...args);this.statusCode=statusCode;}};Reflect.defineProperty(ServerError,'name',{value:Target.name});return ServerError})}

class MalformedRequestError extends SyntaxError{constructor(){super(line`
      There was an error parsing the request body. Please make sure that the
      request body is a valid JSON API document.
    `);}}var MalformedRequestError$1 = createServerError(MalformedRequestError,400);

function parseWrite(req){return new Promise((resolve$$1,reject)=>{let body='';const cleanUp=()=>{req.removeAllListeners('end');req.removeAllListeners('data');req.removeAllListeners('error');};req.on('data',data=>{body+=data.toString();});req.once('end',()=>{const parsed=tryCatchSync(()=>JSON.parse(body));cleanUp();if(parsed){resolve$$1(format(parsed,req.method));}else{reject(new MalformedRequestError$1);}});req.once('error',err=>{cleanUp();reject(err);});})}

function parseRequest(req){switch(req.method){case'POST':case'PATCH':return parseWrite(req).then(params=>Object.assign({},parseRead(req),params));default:return Promise.resolve(parseRead(req));}}

function getDomain({headers,connection:{encrypted}}){return`http${encrypted?'s':''}://${headers.get('host')||'localhost'}`}

function createRequest(req,{logger,router}){const url$$1=Object.assign({},url.parse(req.url,true),{params:[]});const headers=new Map(entries(req.headers));Object.assign(req,{url: url$$1,logger,headers,params:{},method:headers.get('x-http-method-override')||req.method});const route=router.match(req);if(route){Object.assign(req,{route,action:route.action,controller:route.controller});}return req}

function createResponse(res,opts){return Object.assign(res,opts,{stats:[]})}

const VERSION='1.0';const MIME_TYPE='application/vnd.api+json';

class NotAcceptableError extends TypeError{constructor(contentType){super(line`
      Media type parameters is not supported. Try your request again
      without specifying '${contentType.replace(MIME_TYPE,'')}'.
    `);}}var NotAcceptableError$1 = createServerError(NotAcceptableError,406);

class UnsupportedMediaTypeError extends TypeError{constructor(contentType){super(line`
      Media type parameters is not supported. Try your request again
      without specifying '${contentType.replace(MIME_TYPE,'')}'.
    `);}}var UnsupportedMediaTypeError$1 = createServerError(UnsupportedMediaTypeError,415);

class InvalidContentTypeError extends TypeError{constructor(contentType='undefined'){super(line`
      Content-Type: '${contentType}' is not supported. Try your request again
      with Content-Type: '${MIME_TYPE}'.
    `);}}var InvalidContentTypeError$1 = createServerError(InvalidContentTypeError,400);

function isJSONAPI(value){return value.startsWith(MIME_TYPE)}

const PATTERN$1=/^application\/vnd.api\+json;charset=.+$/;function hasMediaType(value){return PATTERN$1.test(value)}

function dataFor(status,err){if(status<400||status>599){return''}const title=STATUS_CODES.get(status);const errData={status:status.toString()};if(title){errData.title=title;}if(err){errData.detail=err.message;}return{errors:[errData],jsonapi:{version:VERSION}}}

function normalize(data){let normalized;let statusCode;switch(typeof data){case'boolean':if(data){statusCode=204;}else{statusCode=401;normalized=dataFor(statusCode);}break;case'number':if(STATUS_CODES.has(data)){statusCode=data;}else{statusCode=404;}normalized=dataFor(statusCode);break;case'object':if(!data){statusCode=404;normalized=dataFor(statusCode);}else if(data instanceof Error){statusCode=parseInt(data.statusCode,10)||500;normalized=dataFor(statusCode,data);}else{normalized=data;}break;case'undefined':statusCode=404;normalized=dataFor(statusCode);break;default:normalized=data;}return{statusCode,data:stringify(normalized)}}

function hasContentType(res){let contentType=res.getHeader('Content-Type');if(!contentType){contentType=res.getHeader('content-type');}return Boolean(contentType)}

function createResponder(req,res){return function respond(data){const normalized=normalize(data);if(normalized.statusCode){Reflect.set(res,'statusCode',normalized.statusCode);}if(res.statusCode!==204&&!hasContentType(res)){res.setHeader('Content-Type',MIME_TYPE);}res.end(normalized.data);}}

function validateAccept(contentType){if(contentType&&hasMediaType(contentType)){throw new NotAcceptableError$1(contentType)}return true}

function validateContentType(contentType){if(!contentType||!isJSONAPI(contentType)){throw new InvalidContentTypeError$1(contentType)}else if(hasMediaType(contentType)){throw new UnsupportedMediaTypeError$1(contentType)}return true}

function setCORSHeaders(res,{origin,methods,headers,enabled}){if(!enabled){return}if(origin){res.setHeader('Access-Control-Allow-Origin',origin);}if(methods){res.setHeader('Access-Control-Allow-Methods',methods.join());}if(headers){res.setHeader('Access-Control-Allow-Headers',headers.join());}}

class Server{constructor({logger,router,cors}){_initialiseProps.call(this);Object.defineProperties(this,{router:{value:router,writable:false,enumerable:false,configurable:false},logger:{value:logger,writable:false,enumerable:false,configurable:false},cors:{value:cors,writable:false,enumerable:false,configurable:false},instance:{value:http.createServer(this.receiveRequest),writable:false,enumerable:false,configurable:false}});}listen(port){this.instance.listen(port);}initializeRequest(req,res){const{logger,router,cors}=this;req.setEncoding('utf8');const response=createResponse(res,{logger});setCORSHeaders(response,cors);const request=createRequest(req,{logger,router});return[request,response]}validateRequest({method,headers}){let isValid=validateAccept(headers.get('accept'));if(HAS_BODY.test(method)){isValid=validateContentType(headers.get('content-type'));}return isValid}}var _initialiseProps=function(){this.receiveRequest=(req,res)=>{const{logger}=this;const[request,response]=this.initializeRequest(req,res);const respond=createResponder(request,response);logger.request(request,response,{startTime:Date.now()});const isValid=tryCatchSync(()=>this.validateRequest(request),respond);if(isValid){parseRequest(request).then(params=>{const{route}=request;Object.assign(request,{params});if(route){return route.visit(request,response)}return undefined}).then(respond).catch(err=>{logger.error(err);respond(err);});}};};

class UniqueConstraintError extends Error{}createServerError(UniqueConstraintError,409);

class ConfigMissingError extends Error{constructor(environment){super(`Database config not found for environment ${environment}.`);}}

function uniq(src,...keys){const hasKeys=Boolean(keys.length);return src.filter((x,xIdx,arr)=>{let lastIdx;if(hasKeys){lastIdx=arr.findIndex((y,yIdx)=>yIdx>xIdx||keys.every(key=>x[key]===y[key]));}else{lastIdx=src.lastIndexOf(x);}return xIdx===lastIdx})}

function scopesFor(target){return Object.keys(target.model.scopes).reduce((scopes,name)=>Object.assign({},scopes,{[name]:{get(){const scope=function(...args){const fn=Reflect.get(target.model,name);const{snapshots}=Reflect.apply(fn,target.model,args);Object.assign(target,{snapshots:[...target.snapshots,...snapshots.map(snapshot=>[...snapshot,name])]});return target};Reflect.defineProperty(scope,'name',{value:name,writable:false,enumerable:false,configurable:false});return scope}}}),{})}

function formatSelect(model,attrs=[],prefix=''){return attrs.map(attr=>{const name=model.columnNameFor(attr)||'undefined';return`${model.tableName}.${name} AS ${prefix}${inflection.camelize(name,true)}`})}

class RecordNotFoundError extends Error{constructor({name,primaryKey},primaryKeyValue){super(`Could not find ${name} with ${primaryKey} ${stringify(primaryKeyValue)}.`);}}var RecordNotFoundError$1 = createServerError(RecordNotFoundError,404);

const RUNNERS=new WeakMap;

function getFindParam({isFind,snapshots,model:{tableName,primaryKey}}){if(isFind){const snapshot=snapshots.find(([method])=>method==='where');if(snapshot){const[,params]=snapshot;if(params&&isObject(params)){return Reflect.get(params,`${tableName}.${primaryKey}`)}}}return undefined}

function promiseHash(promises){if(Object.keys(promises).length){return Promise.all(entries(promises).map(([key,promise])=>new Promise((resolve$$1,reject)=>{if(promise&&typeof promise.then==='function'){promise.then(value=>resolve$$1({[key]:value})).catch(reject);}else{resolve$$1({[key]:promise});}}))).then(objects=>objects.reduce((hash,object)=>Object.assign({},hash,object),{}))}return Promise.resolve({})}

var buildResults = (()=>{var _ref=asyncToGenerator(function*({model,records,relationships}){const results=yield records;const pkPattern=new RegExp(`^.+\\.${model.primaryKey}$`);let related;if(!results.length){return[]}if(Object.keys(relationships).length){related=entries(relationships).reduce(function(obj,entry){const[name,relationship]=entry;let foreignKey=inflection.camelize(relationship.foreignKey,true);if(relationship.through){const query=relationship.model.select(...relationship.attrs);const baseKey=`${relationship.through.tableName}.`+`${inflection.singularize(underscore$1(name))}_id`;foreignKey=`${relationship.through.tableName}.`+`${relationship.foreignKey}`;query.snapshots.push(['select',[`${baseKey} as ${inflection.camelize(baseKey.split('.').pop(),true)}`,`${foreignKey} as ${inflection.camelize(foreignKey.split('.').pop(),true)}`]],['innerJoin',[relationship.through.tableName,`${relationship.model.tableName}.`+`${relationship.model.primaryKey}`,'=',baseKey]],['whereIn',[foreignKey,results.map(function({id}){return id})]]);return Object.assign({},obj,{[name]:query})}return Object.assign({},obj,{[name]:relationship.model.select(...relationship.attrs).where({[foreignKey]:results.map(function({id}){return id})})})},{});related=yield promiseHash(related);}return results.map(function(record){if(related){entries(related).forEach(function([name,relatedResults]){const relationship=model.relationshipFor(name);if(relationship){let{foreignKey}=relationship;foreignKey=inflection.camelize(foreignKey,true);Reflect.set(record,name,relatedResults.filter(function({rawColumnData}){const fk=Reflect.get(rawColumnData,foreignKey);const pk=Reflect.get(record,model.primaryKey);return fk===pk}));}});}const instance=Reflect.construct(model,[entries(record).reduce(function(r,entry){let[key,value]=entry;if(!value&&pkPattern.test(key)){return r}else if(key.indexOf('.')>=0){const[a,b]=key.split('.');let parent=r[a];if(!parent){parent={};}key=a;value=Object.assign({},parent,{[b]:value});}return Object.assign({},r,{[key]:value})},{})]);instance.currentChangeSet.persist();return instance})});function buildResults(_x){return _ref.apply(this,arguments)}return buildResults})();

function createRunner(target,opts){if(opts.resolve&&opts.reject){const{resolve: resolve$$1,reject}=opts;let didRun=false;RUNNERS.set(target,asyncToGenerator(function*(){let results;const{model,isFind,snapshots,collection,shouldCount,relationships}=target;if(didRun){return}didRun=true;if(!shouldCount&&!snapshots.some(function([name]){return name==='select'})){target.select(...target.model.attributeNames);}const records=snapshots.reduce(function(query,snapshot){let[name,params]=snapshot;if(!shouldCount&&name==='includeSelect'){name='select';}const method=Reflect.get(query,name);if(!Array.isArray(params)){params=[params];}return Reflect.apply(method,query,params)},model.table());if(model.store.debug){records.on('query',function(){setImmediate(function(){return model.logger.debug(sql`${records.toString()}`)});});}if(shouldCount){let[{countAll:count}]=yield records;count=parseInt(count,10);resolve$$1(Number.isFinite(count)?count:0);}else{results=yield buildResults({model,records,relationships});if(collection){resolve$$1(results);}else{const[result]=results;if(!result&&isFind){const err=new RecordNotFoundError$1(model,getFindParam(target));reject(err);}resolve$$1(result);}}}));}}function runQuery(target){const runner=RUNNERS.get(target);if(runner){runner();}}

class Query extends Promise{constructor(model){let resolve$$1;let reject;super((res,rej)=>{resolve$$1=res;reject=rej;});createRunner(this,{resolve: resolve$$1,reject});Object.defineProperties(this,{model:{value:model,writable:false,enumerable:false,configurable:false},collection:{value:true,writable:true,enumerable:false,configurable:false},snapshots:{value:[],writable:true,enumerable:false,configurable:false},shouldCount:{value:false,writable:true,enumerable:false,configurable:false},relationships:{value:{},writable:true,enumerable:false,configurable:false}});Object.defineProperties(this,scopesFor(this));}static get[Symbol.species](){return Promise}all(){return this}not(conditions={}){return this.where(conditions,true)}find(primaryKey){Object.assign(this,{isFind:true,collection:false});this.where({[this.model.primaryKey]:primaryKey});if(!this.shouldCount){this.limit(1);}return this}page(num){if(this.shouldCount){return this}let limit=this.snapshots.find(([name])=>name==='limit');if(limit){[,limit]=limit;}if(typeof limit!=='number'){limit=25;}this.limit(limit);return this.offset(Math.max(parseInt(num,10)-1,0)*limit)}limit(amount){if(!this.shouldCount){this.snapshots.push(['limit',amount]);}return this}order(attr,direction='ASC'){if(!this.shouldCount){const columnName=this.model.columnNameFor(attr);if(columnName){this.snapshots=this.snapshots.filter(([method])=>method!=='orderByRaw').concat([['orderByRaw',uniq([columnName,this.model.primaryKey]).map(key=>`${this.model.tableName}.${key} ${direction}`).join(', ')]]);}}return this}where(conditions={},not=false){const{model:{tableName}}=this;const where=entries(conditions).reduce((obj,condition)=>{let[key,value]=condition;const columnName=this.model.columnNameFor(key);if(columnName){key=`${tableName}.${columnName}`;if(typeof value==='undefined'){value=null;}if(Array.isArray(value)){if(value.length>1){this.snapshots.push([not?'whereNotIn':'whereIn',[key,value]]);}else{return Object.assign({},obj,{[key]:value[0]})}}else if(value===null){this.snapshots.push([not?'whereNotNull':'whereNull',[key]]);}else{return Object.assign({},obj,{[key]:value})}}return obj},{});if(Object.keys(where).length){this.snapshots.push([not?'whereNot':'where',where]);}return this}whereBetween(conditions,not=false){const{model:{tableName}}=this;entries(conditions).forEach(condition=>{let[key]=condition;const[,value]=condition;const columnName=this.model.columnNameFor(key);if(columnName){key=`${tableName}.${columnName}`;if(Array.isArray(value)){this.snapshots.push([`where${not?'NotBetween':'Between'}`,[key,value]]);}}});return this}whereRaw(query,bindings=[]){this.snapshots.push(['whereRaw',[query,bindings]]);return this}first(){if(!this.shouldCount){const willSort=this.snapshots.some(([method])=>method==='orderByRaw');this.collection=false;if(!willSort){this.order(this.model.primaryKey,'ASC');}this.limit(1);}return this}last(){if(!this.shouldCount){const willSort=this.snapshots.some(([method])=>method==='orderByRaw');this.collection=false;if(!willSort){this.order(this.model.primaryKey,'DESC');}this.limit(1);}return this}count(){const validName=/^(where(Not)?(In)?)$/g;Object.assign(this,{shouldCount:true,snapshots:[['count','* as countAll'],...this.snapshots.filter(([name])=>validName.test(name))]});return this}offset(amount){if(!this.shouldCount){this.snapshots.push(['offset',amount]);}return this}select(...attrs){if(!this.shouldCount){this.snapshots.push(['select',formatSelect(this.model,attrs)]);}return this}distinct(...attrs){if(!this.shouldCount){this.snapshots.push(['distinct',formatSelect(this.model,attrs)]);}return this.select()}include(...relationships){let included;if(!this.shouldCount){if(relationships.length===1&&typeof relationships[0]==='object'){included=entries(relationships[0]).reduce((arr,relationship)=>{const[name]=relationship;const opts=this.model.relationshipFor(name);let[,attrs]=relationship;if(opts){if(!attrs.length){attrs=opts.model.attributeNames;}return[...arr,{name,attrs,relationship:opts}]}return arr},[]);}else{included=relationships.reduce((arr,name)=>{let str=name;if(typeof str!=='string'){str=String(str);}const opts=this.model.relationshipFor(str);if(opts){const attrs=opts.model.attributeNames;return[...arr,{attrs,name:str,relationship:opts}]}return arr},[]);}const willInclude=included.filter(opts=>{const{name,relationship}=opts;let{attrs}=opts;if(relationship.type==='hasMany'){attrs=relationship.through?attrs:[...attrs,inflection.camelize(relationship.foreignKey,true)];this.relationships[name]={attrs,type:'hasMany',model:relationship.model,through:relationship.through,foreignKey:relationship.foreignKey};return false}return true}).reduce((arr,{name,attrs,relationship})=>{arr.push(['includeSelect',formatSelect(relationship.model,attrs,`${name}.`)]);if(relationship.type==='belongsTo'){arr.push(['leftOuterJoin',[relationship.model.tableName,`${this.model.tableName}.${relationship.foreignKey}`,'=',`${relationship.model.tableName}.`+`${relationship.model.primaryKey}`]]);}else if(relationship.type==='hasOne'){arr.push(['leftOuterJoin',[relationship.model.tableName,`${this.model.tableName}.${this.model.primaryKey}`,'=',`${relationship.model.tableName}.${relationship.foreignKey}`]]);}return arr},[]);this.snapshots.push(...willInclude);}return this}unscope(...scopes){if(scopes.length){const keys=scopes.map(scope=>{if(scope==='order'){return'orderByRaw'}return scope});this.snapshots=this.snapshots.filter(([,,scope])=>{if(typeof scope==='string'){return keys.indexOf(scope)<0}return true});}else{this.snapshots=this.snapshots.filter(([,,scope])=>!scope);}return this}then(onFulfilled,onRejected){runQuery(this);return super.then(onFulfilled,onRejected)}catch(onRejected){runQuery(this);return super.catch(onRejected)}static from(src){const{model,snapshots,collection,shouldCount,relationships}=src;const dest=Reflect.construct(this,[model]);Object.assign(dest,{snapshots,collection,shouldCount,relationships});return dest}}

function mapToObject(source){return Array.from(source).reduce((obj,[key,value])=>Object.assign({},obj,{[String(key)]:value}),{})}

class ChangeSet extends Map{constructor(data={}){super(entries(data));this.isPersisted=false;return this}set(key,value){if(!this.isPersisted){super.set(key,value);}return this}persist(group){if(group){group.forEach(changeSet=>changeSet.unpersist());}this.isPersisted=true;return this}unpersist(){this.isPersisted=false;return this}applyTo(target){const instance=new ChangeSet(mapToObject(this));target.changeSets.unshift(instance);return instance}}

let getHasManyThrough=(()=>{var _ref=asyncToGenerator(function*(owner,{model,inverse,through,foreignKey:baseKey}){const inverseOpts=model.relationshipFor(inverse);let value=[];if(through&&inverseOpts){const foreignKey=inflection.camelize(inverseOpts.foreignKey,true);const records=yield through.select(baseKey,foreignKey).where({[baseKey]:owner.getPrimaryKey()});if(records.length){value=yield model.where({[model.primaryKey]:records.map(function(record){return Reflect.get(record,foreignKey)}).filter(Boolean)});}}return value});return function getHasManyThrough(_x,_x2){return _ref.apply(this,arguments)}})();function getHasOne(owner,{model,foreignKey}){return model.first().where({[foreignKey]:owner.getPrimaryKey()})}function getHasMany(owner,opts){const{model,through,foreignKey}=opts;return through?getHasManyThrough(owner,opts):model.where({[foreignKey]:owner.getPrimaryKey()})}function getBelongsTo(owner,{model,foreignKey}){const foreignValue=Reflect.get(owner,foreignKey);return foreignValue?model.find(foreignValue):Promise.resolve(null)}

function unassociateOne(value,foreignKey){if(value){Reflect.set(value,foreignKey,null);}return value}function unassociate(value,foreignKey){return value.map(record=>unassociateOne(record,foreignKey))}

function validateOne(model,value){return isNull(value)||model.isInstance(value)}function validateType(model,value){if(Array.isArray(value)){return value.every(item=>validateOne(model,item))}return validateOne(model,value)}

function setHasManyInverse(owner,value,{inverse,foreignKey,inverseModel}){const primaryKey=Reflect.get(owner,owner.constructor.primaryKey);const{type:inverseType}=inverseModel.relationshipFor(inverse);for(const record of value){let{currentChangeSet:changeSet}=record;if(owner!==changeSet.get(inverse)){if(changeSet.isPersisted){changeSet=changeSet.applyTo(record);}changeSet.set(inverse,owner);if(inverseType==='belongsTo'){Reflect.set(record,foreignKey,primaryKey);}}}}function setHasOneInverse(owner,value,{inverse,foreignKey,inverseModel}){if(value){const{type:inverseType}=inverseModel.relationshipFor(inverse);let inverseValue=value.currentChangeSet.get(inverse);if(inverseType==='hasMany'){if(!Array.isArray(inverseValue)){inverseValue=[];}if(!inverseValue.includes(owner)){inverseValue.push(owner);}}else if(owner!==inverseValue){inverseValue=owner;if(inverseType==='belongsTo'){Reflect.set(value,foreignKey,inverseValue.getPrimaryKey());}}let{currentChangeSet:changeSet}=value;if(changeSet.isPersisted){changeSet=changeSet.applyTo(value);}changeSet.set(inverse,inverseValue||null);}}

function setHasMany(owner,key,value,{type,model,inverse,foreignKey}){let{currentChangeSet:changeSet}=owner;if(validateType(model,value)){let prevValue=changeSet.get(key);if(Array.isArray(prevValue)){prevValue=unassociate(prevValue,foreignKey);if(Array.isArray(prevValue)){prevValue.filter(prev=>!value.find(next=>prev.getPrimaryKey()===next.getPrimaryKey())).forEach(record=>owner.prevAssociations.add(record));}}if(changeSet.isPersisted){changeSet=changeSet.applyTo(owner);}changeSet.set(key,value);setHasManyInverse(owner,value,{type,model,inverse,foreignKey,inverseModel:model});}}function setHasOne(owner,key,value,{type,model,inverse,foreignKey}){let valueToSet=value;if(value&&typeof value==='object'&&!model.isInstance(value)){valueToSet=Reflect.construct(model,[valueToSet]);}let{currentChangeSet:changeSet}=owner;if(valueToSet){if(validateType(model,valueToSet)){if(changeSet.isPersisted){changeSet=changeSet.applyTo(owner);}changeSet.set(key,valueToSet);}}else{if(changeSet.isPersisted){changeSet=changeSet.applyTo(owner);}changeSet.set(key,null);}setHasOneInverse(owner,valueToSet,{type,model,inverse,foreignKey,inverseModel:model});}function setBelongsTo(owner,key,value,{type,model,inverse,foreignKey}){setHasOne(owner,key,value,{type,model,inverse,foreignKey});if(value){Reflect.set(owner,foreignKey,Reflect.get(value,model.primaryKey));}else{Reflect.set(owner,foreignKey,null);}}

function updateHasOne({record,value,opts,trx}){const recordPrimaryKey=record.getPrimaryKey();if(value){if(value instanceof opts.model){return[opts.model.table().transacting(trx).update(opts.foreignKey,null).where(`${opts.model.tableName}.${opts.foreignKey}`,recordPrimaryKey).whereNot(`${opts.model.tableName}.${opts.model.primaryKey}`,value.getPrimaryKey()),opts.model.table().transacting(trx).update(opts.foreignKey,recordPrimaryKey).where(`${opts.model.tableName}.${opts.model.primaryKey}`,value.getPrimaryKey())]}}else{return[opts.model.table().transacting(trx).update(opts.foreignKey,null).where(`${opts.model.tableName}.${opts.foreignKey}`,recordPrimaryKey)]}return[]}function updateHasMany({record,value,opts,trx}){const recordPrimaryKey=record.getPrimaryKey();if(Array.isArray(value)&&value.length){return[opts.model.table().transacting(trx).update(opts.foreignKey,null).where(`${opts.model.tableName}.${opts.foreignKey}`,recordPrimaryKey).whereNotIn(`${opts.model.tableName}.${opts.model.primaryKey}`,value.map(item=>item.getPrimaryKey())),opts.model.table().transacting(trx).update(opts.foreignKey,recordPrimaryKey).whereIn(`${opts.model.tableName}.${opts.model.primaryKey}`,value.map(item=>item.getPrimaryKey()))]}return[opts.model.table().transacting(trx).update(opts.foreignKey,null).where(`${opts.model.tableName}.${opts.foreignKey}`,recordPrimaryKey)]}function updateBelongsTo({record,value,opts,trx}){if(value instanceof opts.model){const inverseOpts=opts.model.relationshipFor(opts.inverse);const foreignKeyValue=value.getPrimaryKey();Reflect.set(record,opts.foreignKey,foreignKeyValue);if(inverseOpts&&inverseOpts.type==='hasOne'){return[record.constructor.table().transacting(trx).update(opts.foreignKey,null).where(opts.foreignKey,foreignKeyValue).whereNot(`${record.constructor.tableName}.${record.constructor.primaryKey}`,record.getPrimaryKey())]}}return[]}function updateRelationship(record,name,trx){const opts=record.constructor.relationshipFor(name);if(!opts){const{constructor:{name:className}}=record;throw new Error(`Could not find relationship '${name} on '${className}`)}const{dirtyRelationships}=record;if(!dirtyRelationships.has(name)){return[]}const value=dirtyRelationships.get(name);switch(opts.type){case'hasOne':return updateHasOne({record,value,opts,trx});case'hasMany':return updateHasMany({record,value,opts,trx});default:return updateBelongsTo({record,value,opts,trx});}}

function set$1(owner,key,value){const opts=owner.constructor.relationshipFor(key);if(opts){const{type}=opts;let{foreignKey}=opts;foreignKey=inflection.camelize(foreignKey,true);if(Array.isArray(value)){if(type==='hasMany'){setHasMany(owner,key,value,Object.assign({},opts,{foreignKey}));}}else if(type==='hasOne'){setHasOne(owner,key,value,Object.assign({},opts,{foreignKey}));}else if(type==='belongsTo'){setBelongsTo(owner,key,value,Object.assign({},opts,{foreignKey}));}}}let get$1=(()=>{var _ref=asyncToGenerator(function*(owner,key){const opts=owner.constructor.relationshipFor(key);let value=null;if(opts){const{type}=opts;let{foreignKey}=opts;value=owner.currentChangeSet.get(key);foreignKey=inflection.camelize(foreignKey,true);if(!value){switch(type){case'hasOne':value=yield getHasOne(owner,Object.assign({},opts,{foreignKey}));break;case'hasMany':value=yield getHasMany(owner,Object.assign({},opts,{foreignKey}));break;case'belongsTo':value=yield getBelongsTo(owner,Object.assign({},opts,{foreignKey}));break;default:throw new Error(`Unknown relationship type '${type}'.`);}set$1(owner,key,value);}}return value});return function get$$1(_x,_x2){return _ref.apply(this,arguments)}})();

function hasOwnProperty(target,key){return Reflect.apply(Object.prototype.hasOwnProperty,target,[key])}

function trapGet(traps){return(target,key,receiver)=>{if(key==='unwrap'){return()=>target}if(hasOwnProperty(traps,key)){const value=Reflect.get(traps,key);if(typeof value==='function'){return value.bind(receiver,target)}return value}return Reflect.get(target,key)}}

function createStaticTransactionProxy(target,trx){return new Proxy(target,{get:trapGet({create(model,props={}){return model.create(props,trx)}})})}function createInstanceTransactionProxy(target,trx){return new Proxy(target,{get:trapGet({save(model){return model.save(trx)},update(model,props={}){return model.update(props,trx)},destroy(model){return model.destroy(trx)}})})}function createTransactionResultProxy(record,didPersist){return new Proxy(record,{get:trapGet({didPersist})})}

function pick(src,...keys){return setType(()=>keys.map(key=>[key,Reflect.get(src,key)]).filter(([,value])=>typeof value!=='undefined').reduce((result,[key,value])=>Object.assign({},result,{[key]:value}),{}))}

function compose(main,...etc){return input=>main(etc.reduceRight((value,fn)=>fn(value),input))}

function map(a,b){return Array.from(b).reduce((result,[key,value])=>{if(a.get(key)!==value){result.set(key,value);}return result},new Map)}

function getColumns(record,only){let{constructor:{attributes:columns}}=record;if(only){columns=pick(columns,...only);}return entries(columns).reduce((obj,[key,{columnName}])=>Object.assign({},obj,{[columnName]:Reflect.get(record,key)}),{})}

function create(record,trx){const timestamp=new Date;Object.assign(record,{createdAt:timestamp,updatedAt:timestamp});Object.assign(record.rawColumnData,{createdAt:timestamp,updatedAt:timestamp});const{constructor:{primaryKey}}=record;const columns=omit(getColumns(record),primaryKey);if(record.dirtyAttributes.has(primaryKey)){columns[primaryKey]=record.getPrimaryKey();}return[record.constructor.table().transacting(trx).returning(record.constructor.primaryKey).insert(columns)]}function update(record,trx){Reflect.set(record,'updatedAt',new Date);return[record.constructor.table().transacting(trx).where(record.constructor.primaryKey,record.getPrimaryKey()).update(getColumns(record,Array.from(record.dirtyAttributes.keys())))]}function destroy(record,trx){return[record.constructor.table().transacting(trx).where(record.constructor.primaryKey,record.getPrimaryKey()).del()]}function createRunner$1(logger,statements){return query=>{const promises=query.concat(statements);promises.forEach(promise=>{promise.on('query',()=>{setImmediate(()=>{logger.debug(sql`${promise.toString()}`);});});});return Promise.all(promises)}}

function isUndefined(value){return typeof value==='undefined'}

function createGetter({key,defaultValue}){return function getter(){let value=this.currentChangeSet.get(key);if(isNull(value)||isUndefined(value)){value=defaultValue;}return value}}

function createSetter({key,nullable,normalize,defaultValue}){return function setter(nextValue){if(!nullable){if(isNull(nextValue)||isUndefined(nextValue)){return}}let{currentChangeSet:changeSet}=this;const valueToSet=normalize(nextValue);const currentValue=changeSet.get(key)||defaultValue;if(!changeSet.has(key)||valueToSet!==currentValue){if(changeSet.isPersisted){changeSet=changeSet.applyTo(this);}changeSet.set(key,valueToSet);}}}

const BOOLEAN_TYPE=/^(?:boolean|tinyint)$/;function createNormalizer(type){let normalizer=value=>value;if(BOOLEAN_TYPE.test(type)){normalizer=value=>{let normalized=value;if(typeof value==='string'){normalized=Number.parseInt(value,10);}return Boolean(normalized)};}else if(type==='datetime'){normalizer=value=>{let normalized=value;if(typeof value==='number'){normalized=new Date(normalized);}return normalized};}return normalizer}

function createAttribute(opts){const normalize=createNormalizer(opts.type);const meta=Object.assign({},opts,{normalize,defaultValue:normalize(opts.defaultValue)});return{get:createGetter(meta),set:createSetter(meta)}}

const VALID_HOOKS=new Set(['afterCreate','afterDestroy','afterSave','afterUpdate','afterValidation','beforeCreate','beforeDestroy','beforeSave','beforeUpdate','beforeValidation']);function initializeProps(prototype,attributes,relationships){Object.defineProperties(prototype,Object.assign({},entries(attributes).reduce((obj,[key,value])=>Object.assign({},obj,{[key]:createAttribute(Object.assign({key},value))}),{}),Object.keys(relationships).reduce((obj,key)=>Object.assign({},obj,{[key]:{get(){return get$1(this,key)},set(val){set$1(this,key,val);}}}),{})));}function initializeHooks({model,hooks,logger}){return Object.freeze(entries(hooks).reduce((obj,[key,value])=>{if(!VALID_HOOKS.has(key)){logger.warn(line`
          Invalid hook '${key}' will not be added to Model '${model.name}'.
          Valid hooks are ${Array.from(VALID_HOOKS).map(h=>`'${h}'`).join(', ')}.
        `);return obj}return Object.assign({},obj,{[key]:(()=>{var _ref=asyncToGenerator(function*(instance,transaction){yield Reflect.apply(value,model,[instance,transaction]);});return function(_x,_x2){return _ref.apply(this,arguments)}})()})},{}))}function initializeValidations(opts){const{model,logger,attributes}=opts;const attributeNames=Object.keys(attributes);let{validates}=opts;validates=entries(validates).filter(([key,value])=>{let isValid=attributeNames.indexOf(key)>=0;if(!isValid){logger.warn(line`
          Invalid validation '${key}' will not be added to Model
          '${model.name}'. '${key}' is not an attribute of Model
          '${model.name}'.
        `);}if(typeof value!=='function'){isValid=false;logger.warn(line`
          Invalid validation '${key}' will not be added to Model
          '${model.name}'. Validations must be a function.
        `);}return isValid}).reduce((obj,[key,value])=>Object.assign({},obj,{[key]:value}),{});return Object.freeze(validates)}var initializeClass = (()=>{var _ref2=asyncToGenerator(function*({store,table,model}){let{hooks,scopes,validates}=model;const{logger}=store;const modelName=inflection.dasherize(underscore$1(model.name));const resourceName=inflection.pluralize(modelName);const attributes=entries((yield table().columnInfo())).reduce(function(obj,[columnName,value]){return Object.assign({},obj,{[inflection.camelize(columnName,true)]:Object.assign({},value,{columnName,docName:inflection.dasherize(columnName)})})},{});const belongsTo=entries(model.belongsTo||{}).reduce(function(obj,[relatedName,{inverse,model:relatedModel}]){const relationship={};Object.defineProperties(relationship,{model:{value:store.modelFor(relatedModel||relatedName),writable:false,enumerable:true,configurable:false},inverse:{value:inverse,writable:false,enumerable:true,configurable:false},type:{value:'belongsTo',writable:false,enumerable:false,configurable:false},foreignKey:{value:`${underscore$1(relatedName)}_id`,writable:false,enumerable:false,configurable:false}});return Object.assign({},obj,{[relatedName]:relationship})},{});const hasOne=entries(model.hasOne||{}).reduce(function(obj,[relatedName,{inverse,model:relatedModel}]){const relationship={};Object.defineProperties(relationship,{model:{value:store.modelFor(relatedModel||relatedName),writable:false,enumerable:true,configurable:false},inverse:{value:inverse,writable:false,enumerable:true,configurable:false},type:{value:'hasOne',writable:false,enumerable:false,configurable:false},foreignKey:{value:`${underscore$1(inverse)}_id`,writable:false,enumerable:false,configurable:false}});return Object.assign({},obj,{[relatedName]:relationship})},{});const hasMany=entries(model.hasMany||{}).reduce(function(hash,[relatedName,opts]){const{inverse}=opts;const relationship={};let{through,model:relatedModel}=opts;let foreignKey;if(typeof relatedModel==='string'){relatedModel=store.modelFor(relatedModel);}else{relatedModel=store.modelFor(relatedName);}if(typeof through==='string'){through=store.modelFor(through);foreignKey=`${inflection.singularize(underscore$1(inverse))}_id`;}else{foreignKey=`${underscore$1(inverse)}_id`;}Object.defineProperties(relationship,{model:{value:relatedModel,writable:false,enumerable:true,configurable:false},inverse:{value:inverse,writable:false,enumerable:true,configurable:false},through:{value:through,writable:false,enumerable:Boolean(through),configurable:false},type:{value:'hasMany',writable:false,enumerable:false,configurable:false},foreignKey:{value:foreignKey,writable:false,enumerable:false,configurable:false}});return Object.assign({},hash,{[relatedName]:relationship})},{});Object.freeze(hasOne);Object.freeze(hasMany);Object.freeze(belongsTo);const relationships=Object.freeze(Object.assign({},hasOne,hasMany,belongsTo));if(!hooks){hooks={};}if(!scopes){scopes={};}if(!validates){validates={};}Object.defineProperties(model,Object.assign({store:{value:store,writable:false,enumerable:false,configurable:false},table:{value:table,writable:false,enumerable:false,configurable:false},logger:{value:logger,writable:false,enumerable:false,configurable:false},attributes:{value:Object.freeze(attributes),writable:false,enumerable:false,configurable:false},attributeNames:{value:Object.freeze(Object.keys(attributes)),writable:false,enumerable:false,configurable:false},hasOne:{value:hasOne,writable:false,enumerable:Boolean(Object.keys(hasOne).length),configurable:false},hasMany:{value:hasMany,writable:false,enumerable:Boolean(Object.keys(hasMany).length),configurable:false},belongsTo:{value:belongsTo,writable:false,enumerable:Boolean(Object.keys(belongsTo).length),configurable:false},relationships:{value:relationships,writable:false,enumerable:false,configurable:false},relationshipNames:{value:Object.freeze(Object.keys(relationships)),writable:false,enumerable:false,configurable:false},hooks:{value:initializeHooks({model,hooks,logger}),writable:false,enumerable:Boolean(Object.keys(hooks).length),configurable:false},scopes:{value:scopes,writable:false,enumerable:Boolean(Object.keys(scopes).length),configurable:false},validates:{value:initializeValidations({model,logger,validates,attributes}),writable:false,enumerable:Boolean(Object.keys(validates).length),configurable:false},modelName:{value:modelName,writable:false,enumerable:true,configurable:false},resourceName:{value:resourceName,writable:false,enumerable:true,configurable:false},initialized:{value:true,writable:false,enumerable:false,configurable:false}},Object.freeze(entries(scopes).reduce(function(obj,[name,scope]){return Object.assign({},obj,{[name]:{value:scope,writable:false,enumerable:false,configurable:false}})},{}))));initializeProps(model.prototype,attributes,Object.assign({},hasOne,hasMany,belongsTo));Object.defineProperties(model.prototype,{modelName:{value:modelName,writable:false,enumerable:true,configurable:false},resourceName:{value:resourceName,writable:false,enumerable:true,configurable:false},isModelInstance:{value:true,writable:false,enumerable:false,configurable:false}});return model});function initializeClass(_x3){return _ref2.apply(this,arguments)}return initializeClass})();

class ValidationError extends Error{constructor(key,value){super(`Validation failed for ${key}: ${value}`);}}

class Validation{constructor(opts){Object.defineProperties(this,{key:{value:opts.key,writable:false,enumerable:true,configurable:false},value:{value:opts.value,writable:false,enumerable:true,configurable:false},validator:{value:opts.validator,writable:false,enumerable:false,configurable:false}});}isValid(){return this.validator(this.value)}}

function validate(instance){return Array.from(instance.dirtyAttributes).map(([key,value])=>({key,value,validator:Reflect.get(instance.constructor.validates,key)})).filter(({validator})=>validator).map(props=>new Validation(props)).reduce((result,validation)=>{if(!validation.isValid()){throw new ValidationError(validation.key,String(validation.value))}return result},true)}

function runHooks(record,trx,...hooks){return hooks.filter(Boolean).reduce((prev,next)=>prev.then(()=>next(record,trx)),Promise.resolve())}

class Model{constructor(attrs={},initialize=true){Object.defineProperties(this,{changeSets:{value:[new ChangeSet],writable:false,enumerable:false,configurable:false},rawColumnData:{value:attrs,writable:false,enumerable:false,configurable:false},prevAssociations:{value:new Set,writable:false,enumerable:false,configurable:false}});const{constructor:{attributeNames,relationshipNames}}=this;const props=pick(attrs,...attributeNames.concat(relationshipNames));Object.assign(this,props);if(initialize){Reflect.defineProperty(this,'initialized',{value:true,writable:false,enumerable:false,configurable:false});}return this}get isNew(){return!this.persistedChangeSet}get isDirty(){return Boolean(this.dirtyProperties.size)}get persisted(){return!this.isNew&&!this.isDirty}get dirtyAttributes(){const{dirtyProperties,constructor:{relationshipNames}}=this;Array.from(dirtyProperties.keys()).forEach(key=>{if(relationshipNames.indexOf(key)>=0){dirtyProperties.delete(key);}});return dirtyProperties}get dirtyRelationships(){const{dirtyProperties,constructor:{attributeNames}}=this;Array.from(dirtyProperties.keys()).forEach(key=>{if(attributeNames.indexOf(key)>=0){dirtyProperties.delete(key);}});return dirtyProperties}get dirtyProperties(){const{currentChangeSet,persistedChangeSet}=this;if(!persistedChangeSet){return new Map(currentChangeSet)}return map(persistedChangeSet,currentChangeSet)}get currentChangeSet(){return this.changeSets[0]}get persistedChangeSet(){return this.changeSets.find(({isPersisted})=>isPersisted)}transacting(trx){return createInstanceTransactionProxy(this,trx)}transaction(fn){return this.constructor.transaction(fn)}save(transaction){return this.update(mapToObject(this.dirtyProperties),transaction)}update(props={},transaction){var _this=this;const run=(()=>{var _ref=asyncToGenerator(function*(trx){const{constructor:{hooks,logger}}=_this;let statements=[];let promise=Promise.resolve([]);let hadDirtyAttrs=false;let hadDirtyAssoc=false;const associations=Object.keys(props).filter(function(key){return Boolean(_this.constructor.relationshipFor(key))});Object.assign(_this,props);if(associations.length){hadDirtyAssoc=true;statements=associations.reduce(function(arr,key){return[...arr,...updateRelationship(_this,key,trx)]},[]);}if(_this.isDirty){hadDirtyAttrs=true;yield runHooks(_this,trx,hooks.beforeValidation);validate(_this);yield runHooks(_this,trx,hooks.afterValidation,hooks.beforeUpdate,hooks.beforeSave);promise=update(_this,trx);}yield createRunner$1(logger,statements)((yield promise));_this.prevAssociations.clear();_this.currentChangeSet.persist(_this.changeSets);if(hadDirtyAttrs){yield runHooks(_this,trx,hooks.afterUpdate,hooks.afterSave);}return createTransactionResultProxy(_this,hadDirtyAttrs||hadDirtyAssoc)});return function run(_x){return _ref.apply(this,arguments)}})();if(transaction){return run(transaction)}return this.transaction(run)}destroy(transaction){var _this2=this;const run=(()=>{var _ref2=asyncToGenerator(function*(trx){const{constructor:{hooks,logger}}=_this2;yield runHooks(_this2,trx,hooks.beforeDestroy);yield createRunner$1(logger,[])((yield destroy(_this2,trx)));yield runHooks(_this2,trx,hooks.afterDestroy);return createTransactionResultProxy(_this2,true)});return function run(_x2){return _ref2.apply(this,arguments)}})();if(transaction){return run(transaction)}return this.transaction(run)}reload(){if(this.isNew){return Promise.resolve(this)}return this.constructor.find(this.getPrimaryKey())}rollback(){const{persistedChangeSet}=this;if(persistedChangeSet&&!this.currentChangeSet.isPersisted){persistedChangeSet.applyTo(this).persist(this.changeSets);}return this}getAttributes(...keys){return pick(this,...keys)}getPrimaryKey(){return Reflect.get(this,this.constructor.primaryKey)}static create(props={},transaction){var _this3=this;const run=(()=>{var _ref3=asyncToGenerator(function*(trx){const{hooks,logger,primaryKey}=_this3;const instance=Reflect.construct(_this3,[props,false]);let statements=[];const associations=Object.keys(props).filter(function(key){return Boolean(_this3.relationshipFor(key))});if(associations.length){statements=associations.reduce(function(arr,key){return[...arr,...updateRelationship(instance,key,trx)]},[]);}yield runHooks(instance,trx,hooks.beforeValidation);validate(instance);yield runHooks(instance,trx,hooks.afterValidation,hooks.beforeCreate,hooks.beforeSave);const runner=createRunner$1(logger,statements);const[[primaryKeyValue]]=yield runner((yield create(instance,trx)));Reflect.set(instance,primaryKey,primaryKeyValue);Reflect.set(instance.rawColumnData,primaryKey,primaryKeyValue);Reflect.defineProperty(instance,'initialized',{value:true,writable:false,enumerable:false,configurable:false});instance.currentChangeSet.persist(instance.changeSets);yield runHooks(instance,trx,hooks.afterCreate,hooks.afterSave);return createTransactionResultProxy(instance,true)});return function run(_x3){return _ref3.apply(this,arguments)}})();if(transaction){return run(transaction)}return this.transaction(run)}static transacting(trx){return createStaticTransactionProxy(this,trx)}static transaction(fn){return new Promise((resolve$$1,reject)=>{const{store:{connection}}=this;let result;connection.transaction(trx=>{fn(trx).then(data=>{result=data;return trx.commit()}).catch(trx.rollback);}).then(()=>{resolve$$1(result);}).catch(err=>{reject(err);});})}static all(){return new Query(this).all()}static find(primaryKey){return new Query(this).find(primaryKey)}static page(num){return new Query(this).page(num)}static limit(amount){return new Query(this).limit(amount)}static offset(amount){return new Query(this).offset(amount)}static count(){return new Query(this).count()}static order(attr,direction){return new Query(this).order(attr,direction)}static where(conditions){return new Query(this).where(conditions)}static whereBetween(conditions){return new Query(this).whereBetween(conditions)}static whereRaw(query,bindings=[]){return new Query(this).whereRaw(query,bindings)}static not(conditions){return new Query(this).not(conditions)}static first(){return new Query(this).first()}static last(){return new Query(this).last()}static select(...params){return new Query(this).select(...params)}static distinct(...params){return new Query(this).distinct(...params)}static include(...relationships){return new Query(this).include(...relationships)}static unscope(...scopes){return new Query(this).unscope(...scopes)}static hasScope(name){return Boolean(Reflect.get(this.scopes,name))}static isInstance(value){return value instanceof this}static initialize(store,table){if(this.initialized){return Promise.resolve(this)}if(!this.tableName){const getTableName=compose(inflection.pluralize,underscore$1);const tableName=getTableName(this.name);Reflect.defineProperty(this,'tableName',{value:tableName,writable:false,enumerable:true,configurable:false});Reflect.defineProperty(this.prototype,'tableName',{value:tableName,writable:false,enumerable:false,configurable:false});}return initializeClass({store,table,model:this})}static columnFor(key){return Reflect.get(this.attributes,key)}static columnNameFor(key){const column=this.columnFor(key);return column?column.columnName:undefined}static relationshipFor(key){return Reflect.get(this.relationships,key)}}Model.primaryKey='id';

function connect(path$$1,config={}){let{pool}=config;const{host,socket,driver,database,username,password,port,ssl,url: url$$1}=config;if(VALID_DRIVERS.indexOf(driver)<0){throw new InvalidDriverError(driver)}if(pool&&typeof pool==='number'){pool={min:pool>1?2:1,max:pool};}const knex=require(path.join(path$$1,'node_modules','knex'));const usingSQLite=driver==='sqlite3';const connection=DATABASE_URL||url$$1||{host,database,password,port,ssl,user:username,socketPath:socket,filename:usingSQLite?path.join(path$$1,'db',`${database||'default'}_${NODE_ENV}.sqlite`):undefined};return knex({pool,connection,debug:false,client:driver,useNullAsDefault:usingSQLite})}

var createMigrations = (()=>{var _ref=asyncToGenerator(function*(schema){const hasTable=yield schema().hasTable('migrations');if(!hasTable){yield schema().createTable('migrations',function(table){table.string('version',16).primary();});}return true});function createMigrations(_x){return _ref.apply(this,arguments)}return createMigrations})();

function createResolver(resolve$$1,reject){return function fsResolver(err,...args){const[data]=args;if(err){reject(err);return}resolve$$1(args.length>1?args:data);}}

function chain(source){return{pipe(handler){return chain(handler(source))},value(){return source},construct(constructor){return chain(Reflect.construct(constructor,[source]))}}}

function readdir(path$$1){return new Promise((resolve$$1,reject)=>{fs__default.readdir(path$$1,createResolver(resolve$$1,reject));})}

var pendingMigrations = (()=>{var _ref=asyncToGenerator(function*(appPath,table){const migrations=yield readdir(`${appPath}/db/migrate`);const versions=yield table().select().then(function(data){return data.map(function({version}){return version})});return migrations.filter(function(migration){return versions.indexOf(migration.replace(/^(\d{16})-.+$/g,'$1'))<0})});function pendingMigrations(_x,_x2){return _ref.apply(this,arguments)}return pendingMigrations})();

var initialize = (()=>{var _ref=asyncToGenerator(function*(instance,opts){const{path: path$$1,models,logger,checkMigrations}=opts;let{config}=opts;config=Reflect.get(config,NODE_ENV);if(!config){throw new ConfigMissingError(NODE_ENV)}const{debug=NODE_ENV==='development'}=config;Object.defineProperties(instance,{path:{value:path$$1,writable:false,enumerable:false,configurable:false},debug:{value:debug,writable:false,enumerable:false,configurable:false},models:{value:models,writable:false,enumerable:false,configurable:false},logger:{value:logger,writable:false,enumerable:false,configurable:false},config:{value:config,writable:false,enumerable:true,configurable:false},schema:{value:function(){return instance.connection.schema},writable:false,enumerable:false,configurable:false},connection:{value:connect(path$$1,config),writable:false,enumerable:false,configurable:false}});if(cluster.isMaster||cluster.worker&&cluster.worker.id===1){yield createMigrations(instance.schema);if(checkMigrations){const pending=yield pendingMigrations(path$$1,function(){return instance.connection('migrations')});if(pending.length){throw new MigrationsPendingError(pending)}}}yield Promise.all(Array.from(models.values()).map(function(model){return model.initialize(instance,function(){return instance.connection(model.tableName)})}));return instance});function initialize(_x,_x2){return _ref.apply(this,arguments)}return initialize})();

var normalizeModelName = compose(inflection.singularize,inflection.dasherize,underscore$1);

class Migration{constructor(fn){this.fn=fn;}run(schema){return this.fn(schema)}}

function typeForColumn(column){return TYPE_ALIASES.get(column.type)}

class Database{constructor({path: path$$1,models,config,logger,checkMigrations}){return initialize(this,{path: path$$1,models,config,logger,checkMigrations})}modelFor(type){const model=this.models.get(normalizeModelName(type));if(!model){throw new ModelMissingError(type)}return model}}

function hasOwnProperty$1(target,key){return Reflect.apply(Object.prototype.hasOwnProperty,target,[key])}function merge(dest,source){return setType(()=>entries(source).reduce((result,[key,value])=>{if(hasOwnProperty$1(result,key)&&isObject(value)){const currentValue=Reflect.get(result,key);if(isObject(currentValue)){return Object.assign({},result,{[key]:merge(currentValue,value)})}}return Object.assign({},result,{[key]:value})},Object.assign({},dest)))}

function paramsToQuery(model,{id,page,sort,filter,fields,include}){const relationships=entries(model.relationships);let includedFields=omit(fields,model.resourceName);let query={id,filter,select:[model.primaryKey,...Reflect.get(fields,model.resourceName)]};if(page){query=Object.assign({},query,{page:page.number,limit:page.size});}if(sort){if(sort.startsWith('-')){query=Object.assign({},query,{sort:[sort.substr(1),'DESC']});}else{query=Object.assign({},query,{sort:[sort,'ASC']});}}includedFields=entries(includedFields).reduce((result,field)=>{const[key]=field;let[,value]=field;const[name,relationship]=relationships.find(([,{model:related}])=>key===related.resourceName)||[];if(!name||!relationship){return result}if(!value.includes(relationship.model.primaryKey)){value=[relationship.model.primaryKey,...value];}if(include&&value.length===1&&include.includes(name)){value=[...value,...relationship.model.serializer.attributes];}else if(!include&&value.length>1){value=value.slice(0,1);}return Object.assign({},result,{[name]:value})},{});return Object.assign({},query,{include:includedFields})}

function findOne(model,req){const params=merge(req.defaultParams,req.params);const{id,select,include}=paramsToQuery(model,params);return model.find(id).select(...select).include(include)}

function findMany(model,req){const params=merge(req.defaultParams,req.params);const{sort,page,limit,select,filter,include}=paramsToQuery(model,params);return model.select(...select).include(include).limit(limit).page(page).where(filter).order(...sort)}

function resolveRelationships(model,relationships={}){return entries(relationships).reduce((obj,[key,value])=>{let{data=null}=value||{};if(data){const opts=model.relationshipFor(key);if(opts){if(Array.isArray(data)){data=data.map(item=>Reflect.construct(opts.model,[item]));}else{data=Reflect.construct(opts.model,[data]);}}}return Object.assign({},obj,{[key]:data})},{})}

const BUILT_IN_ACTIONS=Object.freeze(['show','index','create','update','destroy']);

class Controller{constructor({model,namespace,serializer}){this.query=[];this.sort=[];this.filter=[];this.params=[];this.beforeAction=[];this.afterAction=[];this.defaultPerPage=25;Object.assign(this,{model,namespace,serializer,hasModel:Boolean(model),hasNamespace:Boolean(namespace),hasSerializer:Boolean(serializer)});freezeProps(this,true,'model','namespace','serializer');freezeProps(this,false,'hasModel','hasNamespace','hasSerializer');}index(req){return findMany(this.model,req)}show(req){return findOne(this.model,req)}create(req,res){var _this=this;return asyncToGenerator(function*(){const{model}=_this;const{url:{pathname},params:{data:{attributes,relationships}}}=req;const record=yield model.create(Object.assign({},attributes,resolveRelationships(model,relationships)));res.setHeader('Location',`${getDomain(req)+pathname}/${record.getPrimaryKey()}`);Reflect.set(res,'statusCode',201);return record.unwrap()})()}update(req){const{model}=this;return findOne(model,req).then(record=>{const{params:{data:{attributes,relationships}}}=req;return record.update(Object.assign({},attributes,resolveRelationships(model,relationships)))}).then(record=>{if(record.didPersist){return record.unwrap()}return 204})}destroy(req){return findOne(this.model,req).then(record=>record.destroy()).then(()=>204)}preflight(){return Promise.resolve(204)}}

class Serializer{constructor({model,parent,namespace}){this.hasOne=[];this.hasMany=[];this.attributes=[];Object.assign(this,{model,parent,namespace});freezeProps(this,true,'model','parent','namespace');}format({data,links,domain,include}){var _this=this;return asyncToGenerator(function*(){let serialized={};const included=[];if(Array.isArray(data)){serialized={data:yield Promise.all(data.map(function(item){return _this.formatOne({item,domain,include,included})}))};}else{serialized={data:yield _this.formatOne({domain,include,included,item:data,links:false})};}if(included.length){serialized=Object.assign({},serialized,{included:uniq(included,'id','type')});}return Object.assign({},serialized,{links,jsonapi:{version:VERSION}})})()}formatOne({item,links,domain,include,included,formatRelationships=true}){var _this2=this;return asyncToGenerator(function*(){const{resourceName:type}=item;const id=String(item.getPrimaryKey());let relationships={};const attributes=dasherizeKeys(item.getAttributes(...Object.keys(item.rawColumnData).filter(function(key){return _this2.attributes.includes(key)})));const serialized={id,type,attributes};if(formatRelationships){relationships=yield promiseHash([..._this2.hasOne,..._this2.hasMany].reduce(function(hash,name){return Object.assign({},hash,{[inflection.dasherize(underscore$1(name))]:asyncToGenerator(function*(){const related=yield Reflect.get(item,name);if(Array.isArray(related)){return{data:yield Promise.all(related.map((()=>{var _ref2=asyncToGenerator(function*(relatedItem){const{data:relatedData}=yield _this2.formatRelationship({domain,included,item:relatedItem,include:include.includes(name)});return relatedData});return function(_x){return _ref2.apply(this,arguments)}})()))}}else if(related&&related.id){return _this2.formatRelationship({domain,included,item:related,include:include.includes(name)})}return{data:null}})()})},{}));}if(Object.keys(relationships).length){serialized.relationships=relationships;}if(links||typeof links!=='boolean'){const{namespace}=_this2;if(namespace){serialized.links={self:`${domain}/${namespace}/${type}/${id}`};}else{serialized.links={self:`${domain}/${type}/${id}`};}}return serialized})()}formatRelationship({item,domain,include,included}){var _this3=this;return asyncToGenerator(function*(){const{namespace}=_this3;const{resourceName:type,constructor:{serializer}}=item;const id=String(item.getPrimaryKey());let links;if(namespace){links={self:`${domain}/${namespace}/${type}/${id}`};}else{links={self:`${domain}/${type}/${id}`};}if(include){included.push((yield serializer.formatOne({item,domain,include:[],included:[],formatRelationships:false})));}return{data:{id,type},links}})()}}

function createDefaultConfig(){const isTestENV=NODE_ENV==='test';const isProdENV=NODE_ENV==='production';return{server:{cors:{enabled:false}},logging:{level:isProdENV?'INFO':'DEBUG',format:isProdENV?'json':'text',enabled:!isTestENV,filter:{params:[]}}}}

function normalizeName(str){let name=str;if(name.startsWith('/')){name=name.substr(1);}if(name.endsWith('/')){name=name.substr(0,name.length-1);}return name}

function normalizePath(str){let path$$1=str;if(!path$$1.startsWith('/')){path$$1=`/${path$$1}`;}if(path$$1.endsWith('/')){path$$1=path$$1.substr(0,path$$1.length-1);}return path$$1}

class Namespace extends FreezeableSet{constructor({name,path: path$$1,namespace,controller,controllers}){super();Object.assign(this,{controller,controllers,name:normalizeName(name),path:normalizePath(path$$1),isRoot:path$$1==='/',namespace:namespace||this});freezeProps(this,true,'name','path','controller','namespace');freezeProps(this,false,'isRoot','controllers');}}

function createQueryString(src,prop){return entries(src).reduce((str,[key,value],index)=>{let result=str;if(index>0){result+='&';}if(prop){result+=`${prop+encodeURIComponent('[')+key+encodeURIComponent(']')}=`;}else{result+=`${key}=`;}if(value&&typeof value==='object'){if(Array.isArray(value)){result+=value.map(encodeURIComponent).join();}else{result=result.substr(0,result.length-(key.length+1))+createQueryString(value,key);}}else if(!value&&typeof value!=='number'){result+='null';}else{result+=encodeURIComponent(value);}return result},'')}

function createLinkTemplate({total,params,domain,pathname,defaultPerPage}){const{page:{size=defaultPerPage}={}}=params;const baseURL=`${domain}${pathname}`;const queryURL=`${baseURL}?`;const baseParams=omit(params,'page');const lastPageNum=total>0?Math.ceil(total/size):1;if(size&&size!==defaultPerPage){baseParams.page={size};}const hasParams=Object.keys(baseParams).length;return function linkTemplate(pageNum){let normalized;switch(pageNum){case'first':normalized=1;break;case'last':normalized=lastPageNum;break;default:normalized=pageNum;}if(normalized<1||normalized>lastPageNum){return null}else if(normalized>1){const paramsForPage=merge(baseParams,{page:{number:normalized}});return queryURL+createQueryString(paramsForPage)}return hasParams?queryURL+createQueryString(baseParams):baseURL}}function createPageLinks(opts){const{page:{number=1}={}}=opts.params;const linkForPage=createLinkTemplate(opts);return{self:linkForPage(number),first:linkForPage('first'),last:linkForPage('last'),prev:linkForPage(number-1),next:linkForPage(number+1)}}

function resource(action){const resourceAction=(()=>{var _ref=asyncToGenerator(function*(req,res){const{route:{action:actionName}}=req;const result=action(req,res);let links={};let data;let total;if(actionName==='index'&&result instanceof Query){[data,total]=yield Promise.all([result,Query.from(result).count()]);}else{data=yield result;}if(Array.isArray(data)||data&&data.isModelInstance){const domain=getDomain(req);const{params,url:{path: path$$1,pathname},route:{controller:{namespace,serializer,defaultPerPage}}}=req;const include=params.include||[];if(actionName==='index'){links=createPageLinks({params,domain,pathname,defaultPerPage,total:total||0});}else if(actionName!=='index'&&namespace){links={self:domain.replace(`/${namespace}`,'')+path$$1};}else if(actionName!=='index'&&!namespace){links={self:domain+path$$1};}return serializer.format({data,links,domain,include})}return data});return function resourceAction(_x,_x2){return _ref.apply(this,arguments)}})();Reflect.defineProperty(resourceAction,'name',{value:action.name});return resourceAction}

const FINAL_HANDLER='__FINAL_HANDLER__';

function getActionName({route:{action}}){return action}

function getControllerName({route:{controller:{constructor:{name}}}}){return name}

function trackPerf(action){const trackedAction=(()=>{var _ref=asyncToGenerator(function*(...args){const[req,res]=args;const start=Date.now();const result=yield action(...args);let{name}=action;let type='middleware';if(name===FINAL_HANDLER){type='action';name=getActionName(req);}else if(!name){name='anonymous';}res.stats.push({type,name,duration:Date.now()-start,controller:getControllerName(req)});return result});return function trackedAction(){return _ref.apply(this,arguments)}})();Reflect.defineProperty(trackedAction,'name',{value:action.name});return trackedAction}

function createAction(type,action,controller){let fn=action.bind(controller);if(type!=='custom'&&controller.hasModel&&controller.hasSerializer){fn=resource(fn);}return[...controller.beforeAction,function __FINAL_HANDLER__(req,res){return fn(req,res)},...controller.afterAction].map(trackPerf)}

class ParameterTypeError extends TypeError{constructor(param,actual){const{type,path: path$$1}=param;super(line`
      Expected type '${type||'undefined'}' for parameter '${path$$1}' but got
      '${actual}'.
    `);}}var ParameterTypeError$1 = createServerError(ParameterTypeError,400);

class ParameterValueError extends TypeError{constructor(param,actual){super(line`
      Expected value for parameter '${param.path}' to be one of
      [${param.size?Array.from(param.values()).join(', '):''}] but got
      ${actual}.
    `);}}var ParameterValueError$1 = createServerError(ParameterValueError,400);

class InvalidParameterError extends TypeError{constructor(path$$1){super(`'${path$$1}' is not a valid parameter for this resource.`);}}var InvalidParameterError$1 = createServerError(InvalidParameterError,400);

class ResourceMismatchError extends TypeError{constructor(path$$1,expected,actual){let normalized=actual;if(typeof normalized==='string'){normalized=`'${String(normalized)}'`;}super(line`
      Expected '${String(expected)}' for parameter '${path$$1}' but got
      ${String(normalized)}.
    `);}}var ResourceMismatchError$1 = createServerError(ResourceMismatchError,409);

class ParameterRequiredError extends TypeError{constructor(path$$1){super(`Missing required parameter '${path$$1}'.`);}}var ParameterRequiredError$1 = createServerError(ParameterRequiredError,400);

class ParameterNotNullableError extends TypeError{constructor({path: path$$1}){super(`Parameter '${path$$1}' is not nullable.`);}}var ParameterNotNullableError$1 = createServerError(ParameterNotNullableError,400);

function isBuffer(value){return value instanceof Buffer}

function validateType$1(param,value){const{type,required}=param;const valueIsNull=isNull(value);if(required&&valueIsNull){throw new ParameterNotNullableError$1(param)}else if(valueIsNull||!type){return true}const valueType=typeof value;let isValid=true;switch(type){case'array':isValid=Array.isArray(value);break;case'buffer':isValid=isBuffer(value);break;case'object':isValid=isObject(value)||isNull(value);break;case'date':isValid=value instanceof Date;break;default:isValid=type===valueType;}if(!isValid){throw new ParameterTypeError$1(param,valueType)}return isValid}

function hasRequiredParams(group,params){for(const[key,{path: path$$1,required}]of group){if(required&&!Reflect.has(params,key)){throw new ParameterRequiredError$1(path$$1)}}return true}

class ParameterGroup extends FreezeableMap{constructor(contents,{path: path$$1,required,sanitize}){super(contents);Object.assign(this,{path: path$$1,type:'object',required:Boolean(required),sanitize:Boolean(sanitize)});this.freeze();}validate(params){const validated={};if(isNull(params)){return params}if(validateType$1(this,params)&&hasRequiredParams(this,params)){const{sanitize}=this;let{path: path$$1}=this;if(path$$1.length){path$$1=`${path$$1}.`;}for(const[key,value]of entries(params)){const match=this.get(key);if(match){Reflect.set(validated,key,match.validate(value));}else if(!match&&!sanitize){throw new InvalidParameterError$1(`${path$$1}${key}`)}}}return validated}}

function validateOne$1(param,value){if(!param.required&&isNull(value)){return value}if(!param.has(value)){let expected;switch(param.path){case'data.type':[expected]=Array.from(param.values());throw new ResourceMismatchError$1(param.path,expected,value);default:throw new ParameterValueError$1(param,value);}}return value}function validateValue(param,value){if(Array.isArray(value)){if(param.sanitize){return value.filter(item=>param.has(item))}for(const item of value){validateOne$1(param,item);}}else{validateOne$1(param,value);}return value}

class Parameter extends FreezeableSet{constructor({path: path$$1,type,values,required,sanitize}){super(values);Object.assign(this,{path: path$$1,type,required:Boolean(required),sanitize:Boolean(sanitize)});this.freeze();}validate(value){validateType$1(this,value);if(this.size>0){return validateValue(this,value)}return value}}

function getURLParams(dynamicSegments){return dynamicSegments.map(param=>[param,new Parameter({path:param,required:true})])}

function getIDParam({model}){const primaryKeyColumn=model.columnFor(model.primaryKey);let primaryKeyType='number';if(primaryKeyColumn){primaryKeyType=typeForColumn(primaryKeyColumn);}return['id',new Parameter({type:primaryKeyType,path:'data.id',required:true})]}function getTypeParam({model}){return['type',new Parameter({type:'string',path:'data.type',values:[model.resourceName],required:true})]}function getAttributesParam({model,params}){return['attributes',new ParameterGroup(params.reduce((group,param)=>{const col=model.columnFor(param);if(col){const type=typeForColumn(col);const path$$1=`data.attributes.${param}`;const required=!col.nullable&&isNull(col.defaultValue);return[...group,[param,new Parameter({type,path: path$$1,required})]]}return group},[]),{path:'data.attributes',sanitize:true})]}function getRelationshipsParam({model,params}){return['relationships',new ParameterGroup(params.reduce((group,param)=>{const path$$1=`data.relationships.${param}`;const opts=model.relationshipFor(param);if(!opts){return group}if(opts.type==='hasMany'){return[...group,[param,new ParameterGroup([['data',new Parameter({type:'array',path:`${path$$1}.data`,required:true})]],{path: path$$1})]]}const primaryKeyColumn=opts.model.columnFor(opts.model.primaryKey);let primaryKeyType='number';if(primaryKeyColumn){primaryKeyType=typeForColumn(primaryKeyColumn);}return[...group,[param,new ParameterGroup([['data',new ParameterGroup([['id',new Parameter({type:primaryKeyType,path:`${path$$1}.data.id`,required:true})],['type',new Parameter({type:'string',path:`${path$$1}.data.type`,values:[opts.model.resourceName],required:true})]],{type:'array',path:`${path$$1}.data`,required:true})]],{path: path$$1})]]},[]),{path:'data.relationships'})]}function getDataParams(controller,includeID){let params=[getTypeParam(controller)];if(controller.hasModel){params=[getAttributesParam(controller),getRelationshipsParam(controller),...params];if(includeID){params=[getIDParam(controller),...params];}}return['data',new ParameterGroup(params,{path:'data',required:true})]}

function getDefaultMemberParams({model,serializer:{hasOne,hasMany,attributes}}){return{fields:Object.assign({[model.resourceName]:attributes},[...hasOne,...hasMany].reduce((include,key)=>{const opts=model.relationshipFor(key);if(!opts||model===opts.model){return include}return Object.assign({},include,{[opts.model.resourceName]:[opts.model.primaryKey]})},{}))}}

function getDefaultCollectionParams(controller){return Object.assign({},getDefaultMemberParams(controller),{filter:{},sort:'createdAt',page:{size:controller.defaultPerPage,number:1}})}

function getPageParam(){return['page',new ParameterGroup([['size',new Parameter({path:'page.size',type:'number'})],['number',new Parameter({path:'page.number',type:'number'})]],{path:'page'})]}function getSortParam({sort}){return['sort',new Parameter({path:'sort',type:'string',values:[...sort,...sort.map(value=>`-${value}`)]})]}function getFilterParam({filter}){return['filter',new ParameterGroup(filter.map(param=>[param,new Parameter({path:`filter.${param}`})]),{path:'filter'})]}function getFieldsParam({model,serializer:{hasOne,hasMany,attributes}}){const relationships=[...hasOne,...hasMany];return['fields',new ParameterGroup([[model.resourceName,new Parameter({path:`fields.${model.resourceName}`,type:'array',values:attributes,sanitize:true})],...relationships.reduce((result,relationship)=>{const opts=model.relationshipFor(relationship);if(opts){return[...result,[opts.model.resourceName,new Parameter({path:`fields.${opts.model.resourceName}`,type:'array',sanitize:true,values:[opts.model.primaryKey,...opts.model.serializer.attributes]})]]}return result},[])],{path:'fields',sanitize:true})]}function getIncludeParam({serializer:{hasOne,hasMany}}){const relationships=[...hasOne,...hasMany];return['include',new Parameter({path:'include',type:'array',values:relationships})]}function getCustomParams({query}){return query.map(param=>[param,new Parameter({path:param})])}function getMemberQueryParams(controller){if(controller.hasModel){return[getFieldsParam(controller),getIncludeParam(controller),...getCustomParams(controller)]}return getCustomParams(controller)}function getCollectionQueryParams(controller){if(controller.hasModel){return[getPageParam(),getSortParam(controller),getFilterParam(controller),getFieldsParam(controller),getIncludeParam(controller),...getCustomParams(controller)]}return getCustomParams(controller)}

function validateResourceId({params:{id,data:{id:resourceId}}}){if(id!==resourceId){throw new ResourceMismatchError$1('data.id',String(id),String(resourceId))}return true}

function paramsFor({type,method,controller,dynamicSegments}){let params=getURLParams(dynamicSegments);if(type==='member'){params=[...params,...getMemberQueryParams(controller)];if(method==='POST'||method==='PATCH'){params=[...params,getDataParams(controller,true)];}}else if(type==='collection'){params=[...params,...getCollectionQueryParams(controller)];if(method==='POST'||method==='PATCH'){params=[...params,getDataParams(controller,false)];}}else if(type==='custom'){params=[...params,...getCustomParams(controller)];}return new ParameterGroup(params,{path:'',required:true})}function defaultParamsFor({type,controller}){const{hasModel}=controller;if(hasModel&&type==='member'){return getDefaultMemberParams(controller)}else if(hasModel&&type==='collection'){return getDefaultCollectionParams(controller)}return{}}

function getStaticPath(path$$1,dynamicSegments){let staticPath=path$$1;if(dynamicSegments.length){const pattern=new RegExp(`(${dynamicSegments.join('|')})`,'g');staticPath=path$$1.replace(pattern,'dynamic');}return staticPath}

const DYNAMIC_PATTERN=/(:\w+)/g;

function getDynamicSegments(path$$1){const matches=path$$1.match(DYNAMIC_PATTERN)||[];const dynamicSegments=new Array(matches.length);insert(dynamicSegments,matches.map(part=>part.substr(1)));Object.freeze(dynamicSegments);return dynamicSegments}

class Route extends FreezeableSet{constructor({type,path: path$$1,action,method,controller}){const dynamicSegments=getDynamicSegments(path$$1);if(action&&controller){const handler=Reflect.get(controller,action);if(typeof handler==='function'){const params=paramsFor({type,method,controller,dynamicSegments});const staticPath=getStaticPath(path$$1,dynamicSegments);const defaultParams=defaultParamsFor({type,controller});super(createAction(type,handler,controller));Object.assign(this,{type,path: path$$1,params,action,method,controller,staticPath,defaultParams,dynamicSegments});freezeProps(this,true,'type','path');freezeProps(this,false,'action','params','method','controller','staticPath');deepFreezeProps(this,false,'defaultParams','dynamicSegments');}else{const{constructor:{name:controllerName}}=controller;throw new TypeError(`Handler for ${controllerName}#${action} is not a function.`)}}else{throw new TypeError('Arguments `controller` and `action` must not be undefined')}this.freeze();}parseParams(params){return params.reduce((result,value,idx)=>{const key=this.dynamicSegments[idx];if(key){return Object.assign({},result,{[key]:Number.parseInt(value,10)})}return result},{})}execHandlers(req,res){var _this=this;return asyncToGenerator(function*(){let calledFinal=false;let data;for(const handler of _this){data=yield handler(req,res,data);if(handler.name===FINAL_HANDLER){calledFinal=true;}if(!calledFinal&&typeof data!=='undefined'){break}}return data})()}visit(req,res){var _this2=this;return asyncToGenerator(function*(){const{defaultParams}=_this2;let params=Object.assign({},req.params,_this2.parseParams(req.url.params));if(req.method!=='OPTIONS'){params=_this2.params.validate(params);}Object.assign(req,{params,defaultParams});if(_this2.type==='member'&&req.method==='PATCH'){validateResourceId(req);}return _this2.execHandlers(req,res)})()}}

function normalizeOnly(only){return only.filter(action=>BUILT_IN_ACTIONS.indexOf(action)>=0)}

class Resource extends Namespace{constructor(_ref){let{only}=_ref,opts=objectWithoutProperties(_ref,['only']);super(opts);Reflect.defineProperty(this,'only',{value:new FreezeableSet(normalizeOnly(only)),writable:false,enumerable:false,configurable:false});this.only.freeze();}}

class ControllerMissingError extends ReferenceError{constructor(resource){super(`Could not resolve controller by name '${resource}'`);}}

function createDefinition({type,method,namespace}){return function define(name,action=normalizeName(name)){const normalized=normalizeName(name);const{controller}=namespace;let{path: path$$1}=namespace;if(type==='member'){path$$1+=`/:id/${normalized}`;}else{path$$1+=`/${normalized}`;}path$$1=normalizePath(path$$1);const opts={type,path: path$$1,action,method,controller};namespace.add(new Route(opts)).add(new Route(Object.assign({},opts,{type:'custom',method:'HEAD',action:'preflight'}))).add(new Route(Object.assign({},opts,{type:'custom',method:'OPTIONS',action:'preflight'})));}}

function createDefinitionGroup(type,namespace){return REQUEST_METHODS.reduce((methods,method)=>Object.assign({},methods,{[method.toLowerCase()]:createDefinition({type,method,namespace})}),{})}

function normalizeResourceArgs(args){const[name]=args;let[,opts,builder]=args;if(!opts){opts={path:'',only:undefined};}if(typeof opts==='function'){builder=opts;opts={path:'',only:undefined};}if(typeof builder!=='function'){builder=()=>undefined;}opts=Object.assign({},opts,{name});if(!opts.path){opts=Object.assign({},opts,{path:`/${name}`});}if(!opts.only){opts=Object.assign({},opts,{only:[...BUILT_IN_ACTIONS]});}return[opts,builder]}

function contextFor(build){return{create(namespace){let context=Object.assign({member:K,resource:K,namespace:K,collection:K},createDefinitionGroup('custom',namespace));if(namespace instanceof Resource){context=Object.assign({},context,{member(builder){const childCtx=createDefinitionGroup('member',namespace);Reflect.apply(builder,childCtx,[]);},collection(builder){const childCtx=createDefinitionGroup('collection',namespace);Reflect.apply(builder,childCtx,[]);}});}else{context=Object.assign({},context,{namespace(name,builder){const{isRoot,controllers}=namespace;let{path: path$$1}=namespace;path$$1=isRoot?`/${name}`:`${path$$1}/${name}`;const controllerKey=`${path$$1.substr(1)}/application`;const controller=controllers.get(controllerKey);if(!controller){throw new ControllerMissingError(controllerKey)}const child=new Namespace({name,path: path$$1,namespace,controller,controllers});build(builder,child);namespace.add(child);},resource(...args){const{controllers}=namespace;const[opts,builder]=normalizeResourceArgs(args);let path$$1;if(namespace.isRoot){path$$1=opts.path;}else{path$$1=namespace.path+opts.path;}const controllerKey=path$$1.split('/').filter(Boolean).reduce((arr,str,index,parts)=>[...arr,index===parts.length-1?opts.name:str],[]).join('/');const controller=controllers.get(controllerKey);if(!controller){throw new ControllerMissingError(controllerKey)}const child=new Resource(Object.assign({},opts,{path: path$$1,namespace,controller,controllers}));build(builder,child);namespace.add(child);}});}return context}}}

function build(builder,namespace){const context=contextFor(build).create(namespace);if(namespace instanceof Resource){const{only}=namespace;context.member(function member(){if(only.has('show')){this.get('/','show');}if(only.has('update')){this.patch('/','update');}if(only.has('destroy')){this.delete('/','destroy');}});context.collection(function collection(){if(only.has('index')){this.get('/','index');}if(only.has('create')){this.post('/','create');}});}if(builder){Reflect.apply(builder,context,[]);}return namespace}function define(router,parent){parent.forEach(child=>{if(child instanceof Route){const{method,staticPath}=child;router.set(`${method}:${staticPath}`,child);}else{define(router,child);}});}

function createReplacer(controllers){const names=Array.from(controllers).map(([,controller])=>{const{model,namespace}=controller;if(model){return model.resourceName}let{constructor:{name}}=controller;name=name.replace(/controller/ig,'').toLowerCase();return namespace.split('/').reduce((str,part)=>str.replace(new RegExp(part,'ig'),''),name)}).filter((str,idx,arr)=>idx===arr.lastIndexOf(str)).join('|');return new RegExp(`(${names})/(\\d+)`,'ig')}

class Router extends FreezeableMap{constructor({routes,controller,controllers}){const definitions=build(routes,new Namespace({controller,controllers,path:'/',name:'root'}));super();define(this,definitions);Reflect.defineProperty(this,'replacer',{value:createReplacer(controllers),writable:false,enumerable:false,configurable:false});this.freeze();}match({method,url: url$$1}){const params=[];const staticPath=url$$1.pathname.replace(this.replacer,(str,g1,g2)=>{params.push(g2);return`${g1}/:dynamic`});Reflect.set(url$$1,'params',params);return this.get(`${method}:${staticPath}`)}}

const NAMESPACE_DELIMITER=/\$-/g;function formatKey(key,formatter){return chain(key).pipe(str=>{if(formatter){return formatter(str)}return str}).pipe(underscore$1).pipe(inflection.dasherize).pipe(str=>str.replace(NAMESPACE_DELIMITER,'/')).value()}

const SUFFIX_PATTERN=/^.+(Controller|Down|Serializer|Up)/;function normalize$1(manifest){return entries(manifest).reduce((obj,[key,value])=>{if(SUFFIX_PATTERN.test(key)){const suffix=key.replace(SUFFIX_PATTERN,'$1');const stripSuffix=source=>source.replace(suffix,'');switch(suffix){case'Controller':obj.controllers.set(formatKey(key,stripSuffix),value);break;case'Serializer':obj.serializers.set(formatKey(key,stripSuffix),value);break;case'Up':case'Down':obj.migrations.set(formatKey(key),Reflect.construct(Migration,[value]));break;default:break;}}else{switch(key){case'Application':case'routes':case'seed':Reflect.set(obj,formatKey(key),value);break;case'config':Reflect.set(obj,'config',Object.assign({},merge(createDefaultConfig(),Object.assign({},obj.config,value))));break;case'database':Reflect.set(obj,'config',Object.assign({},obj.config,{database:value}));break;default:obj.models.set(formatKey(key),value);break;}}return obj},{config:{},controllers:new FreezeableMap,migrations:new FreezeableMap,models:new FreezeableMap,serializers:new FreezeableMap})}function bundleFor(path$$1){const manifest=Reflect.apply(require,null,[path.join(path$$1,'dist','bundle')]);return chain(manifest).pipe(normalize$1).pipe(entries).construct(FreezeableMap).value().freeze()}

function closestAncestor(source,key){const name=path.posix.basename(key);let namespace=path.posix.dirname(key);if(namespace==='.'){return source.get(name)}namespace=path.posix.dirname(namespace);const ancestor=source.get(path.posix.join(namespace,name));if(ancestor){return ancestor}return closestAncestor(source,path.posix.join(path.posix.dirname(namespace),name))}

function closestChild(source,key){const[[,result]=[]]=Array.from(source).map(([path$$1,value])=>[path.posix.basename(path$$1),value]).filter(([resource])=>key===resource);return result}

function resolve$1(group){return Array.from(group).map(([key,value])=>{let namespace=key.split('/');namespace=namespace.slice(0,Math.max(namespace.length-1,0)).join('/');if(namespace){return[key.substr(namespace.length+1),value,namespace]}return[key,value,'root']}).reduce((map,[key,value,namespace])=>{let nsValue=map.get(namespace);if(!nsValue){nsValue=new FreezeableMap;}return map.set(namespace,nsValue.set(key,value))},new FreezeableMap)}

function sortByNamespace([a],[b]){if(a==='root'){return-1}else if(b==='root'){return 1}return Math.min(Math.max(a.length-b.length,-1),1)}

function createParentBuilder(construct){return target=>Array.from(target).sort(sortByNamespace).reduce((result,[key,value])=>{let parent=value.get('application')||null;if(parent){let grandparent=null;if(key!=='root'){grandparent=result.find(namespace=>{const dirname=path.posix.dirname(key);if(namespace.key==='root'){return dirname==='.'}return dirname===namespace.key});if(grandparent){grandparent=grandparent.parent;}}parent=construct(`${key}/application`,parent,grandparent);}return[...result,{key,value,parent}]},[])}

function createChildrenBuilder(construct){return target=>target.map(({key,value,parent})=>Array.from(value).map(([name,constructor])=>{const normalized=key==='root'?name:`${key}/${name}`;if(parent&&normalized.endsWith('application')){return[normalized,parent]}return[normalized,construct(normalized,constructor,parent)]}))}

function build$1(group,construct){return chain(group).pipe(resolve$1).pipe(createParentBuilder(construct)).pipe(createChildrenBuilder(construct)).pipe(arr=>arr.reduce((result,value)=>[...result,...value],[])).construct(FreezeableMap).value()}

function createLoader(path$$1){let bundle;return function load(type){if(!bundle){bundle=bundleFor(path$$1);}return bundle.get(type)}}

function normalizePort(port){switch(typeof port){case'string':return Number.parseInt(port,10);case'number':return Math.abs(port);default:return 4000;}}

function createController(constructor,opts){const{key,store,serializers}=opts;const namespace=path.posix.dirname(key).replace('.','');let{parent}=opts;let model=tryCatchSync(()=>store.modelFor(path.posix.basename(key)));let serializer=serializers.get(key);if(!model){model=null;}if(!parent){parent=null;}if(!serializer){serializer=closestAncestor(serializers,key);}const instance=Reflect.construct(constructor,[{model,namespace,serializer}]);if(serializer){if(!instance.filter.length){instance.filter=[...serializer.attributes];}if(!instance.sort.length){instance.sort=[...serializer.attributes];}}if(parent){instance.beforeAction=[...parent.beforeAction.map(fn=>fn.bind(parent)),...instance.beforeAction.map(fn=>fn.bind(instance))];instance.afterAction=[...instance.afterAction.map(fn=>fn.bind(instance)),...parent.afterAction.map(fn=>fn.bind(parent))];}Reflect.defineProperty(instance,'parent',{value:parent,writable:false,enumerable:true,configurable:false});return deepFreezeProps(instance,true,'query','sort','filter','params','beforeAction','afterAction')}

function createSerializer(constructor,opts){const{key,store}=opts;const namespace=path.posix.dirname(key).replace('.','');let{parent}=opts;let model=tryCatchSync(()=>store.modelFor(path.posix.basename(key)));if(!model){model=null;}if(!parent){parent=null;}const instance=Reflect.construct(constructor,[{model,parent,namespace}]);Reflect.defineProperty(instance,'parent',{value:parent,writable:false,enumerable:true,configurable:false});return deepFreezeProps(instance,true,'hasOne','hasMany','attributes')}

var initialize$2 = (()=>{var _ref=asyncToGenerator(function*(app,{path: path$$1,port,logging,database,server:serverConfig}){const load=createLoader(path$$1);const routes=load('routes');const models=load('models');const logger=new Logger(logging);const normalizedPort=normalizePort(port);const store=yield new Database({path: path$$1,models,logger,config:database,checkMigrations:true});const serializers=build$1(load('serializers'),function(key,value,parent){return createSerializer(value,{key,store,parent})});models.forEach(function(model){Reflect.defineProperty(model,'serializer',{value:closestChild(serializers,model.resourceName),writable:false,enumerable:false,configurable:false});});const controllers=build$1(load('controllers'),function(key,value,parent){return createController(value,{key,store,parent,serializers})});controllers.forEach(function(controller){Reflect.defineProperty(controller,'controllers',{value:controllers,writable:true,enumerable:false,configurable:false});});const ApplicationController=controllers.get('application');if(!ApplicationController){throw new ControllerMissingError('application')}const router=new Router({routes,controllers,controller:ApplicationController});const server=new Server(Object.assign({router,logger},serverConfig));if(!LUX_CONSOLE){server.instance.listen(normalizedPort).once('listening',function(){if(typeof process.send==='function'){process.send('ready');}else{process.emit('ready');}});}Object.assign(app,{logger,models,controllers,serializers});deepFreezeProps(app,true,'logger','models','controllers','serializers');Object.assign(app,{path: path$$1,store,router,server,port:normalizedPort});freezeProps(app,false,'path','port','store','router','server');return Object.freeze(app)});function initialize(_x,_x2){return _ref.apply(this,arguments)}return initialize})();

class Application{constructor(opts){return initialize$2(this,merge(createDefaultConfig(),opts))}}

class Todo extends Application {}

Object.defineProperty(Todo, 'name', { value: 'Todo' });

class TasksController extends Controller {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.params = ['name', 'list', 'dueDate', 'isCompleted'], _temp;
  }

}

Object.defineProperty(TasksController, 'name', { value: 'TasksController' });

var database = {
  development: {
    driver: 'sqlite3',
    database: 'todo_dev'
  },

  test: {
    driver: 'sqlite3',
    database: 'todo_test'
  },

  production: {
    driver: 'sqlite3',
    database: 'todo_prod'
  }
};

function up(schema) {
  return schema.createTable('tasks', table => {
    table.increments('id');

    table.string('name').index().defaultTo('New Task').notNullable();

    table.boolean('is_completed').index().defaultTo(false).notNullable();

    table.datetime('due_date').index();

    table.integer('list_id').index();

    table.timestamps();
    table.index('created_at');
    table.index('updated_at');
  });
}

function down(schema) {
  return schema.dropTable('tasks');
}

function up$1(schema) {
  return schema.createTable('lists', table => {
    table.increments('id');

    table.string('name').index().defaultTo('New List').notNullable();

    table.timestamps();
    table.index('created_at');
    table.index('updated_at');
  });
}

function down$1(schema) {
  return schema.dropTable('lists');
}

class List extends Model {}

Object.defineProperty(List, 'name', { value: 'List' });

List.hasMany = {
  tasks: {
    inverse: 'list'
  }
};

class Task extends Model {}

Object.defineProperty(Task, 'name', { value: 'Task' });

Task.belongsTo = {
  list: {
    inverse: 'tasks'
  }
};

function* range(start = 1, end = 1) {
  while (start <= end) {
    yield start++;
  }
}

const {
  date,
  hacker,
  random,
  company,
  helpers: {
    randomize
  }
} = faker;

var seed = (() => {
  var _ref = asyncToGenerator(function* (trx) {
    yield Promise.all(Array.from(range(1, 4)).map(function () {
      return List.transacting(trx).create({
        name: `${company.bsAdjective()} tasks`
      });
    }));

    yield Promise.all(Array.from(range(1, 100)).map(function () {
      return Task.transacting(trx).create({
        name: hacker.phrase(),
        listId: randomize(Array.from(range(1, 4))),
        dueDate: date.future(),
        isCompleted: random.boolean()
      });
    }));
  });

  function seed(_x) {
    return _ref.apply(this, arguments);
  }

  return seed;
})();

function routes() {
  this.resource('tasks');
  this.resource('lists');
}

class ApplicationSerializer extends Serializer {}

Object.defineProperty(ApplicationSerializer, 'name', { value: 'ApplicationSerializer' });

class ListsSerializer extends Serializer {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.attributes = ['name', 'createdAt', 'updatedAt'], this.hasMany = ['tasks'], _temp;
  }

}

Object.defineProperty(ListsSerializer, 'name', { value: 'ListsSerializer' });

class TasksSerializer extends Serializer {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.attributes = ['name', 'dueDate', 'createdAt', 'updatedAt', 'isCompleted'], this.hasOne = ['list'], _temp;
  }

}

Object.defineProperty(TasksSerializer, 'name', { value: 'TasksSerializer' });

class ApplicationController extends Controller {}

Object.defineProperty(ApplicationController, 'name', { value: 'ApplicationController' });

var development = {
  server: {
    cors: {
      origin: '*',
      enabled: true,

      headers: ['Accept', 'Content-Type'],

      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
    }
  },
  logging: {
    level: 'DEBUG',
    format: 'text',
    enabled: true,

    filter: {
      params: []
    }
  }
};

class ListsController extends Controller {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.params = ['name'], _temp;
  }

}

Object.defineProperty(ListsController, 'name', { value: 'ListsController' });

exports.Application = Todo;
exports.TasksController = TasksController;
exports.database = database;
exports.createTasksUp = up;
exports.createListsUp = up$1;
exports.List = List;
exports.Task = Task;
exports.seed = seed;
exports.routes = routes;
exports.ApplicationSerializer = ApplicationSerializer;
exports.ListsSerializer = ListsSerializer;
exports.TasksSerializer = TasksSerializer;
exports.ApplicationController = ApplicationController;
exports.config = development;
exports.ListsController = ListsController;
exports.createTasksDown = down;
exports.createListsDown = down$1;
//# sourceMappingURL=bundle.js.map
