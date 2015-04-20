function MorphoModel()
{
  this.service  = {};
  this.types    = {};
  this.errors   = [];
}

this.Morpho = {
  register: function(name, fromFunc, toFunc){
    if(fromFunc){
      this['loadFrom' + name] = function(){
        var model = new MorphoModel();
        fromFunc.apply(model, arguments);
        return model;
      };
    }
    
    if(toFunc)
      MorphoModel.prototype['to' + name] = toFunc;
  }
};

this.config = this.config || {};

this.log = (function(enableLog){
  function nop(){}
  return enableLog ? console.log : nop;
})(this.config.trace);


function Visitor()
{
  this._level   = 0;
  this._prefix  = '';
}

Visitor.prototype.log=function()
{
  var args = Array.prototype.slice.call(arguments); 
  // args.unshift(this._prefix);
  args[0] = this._prefix + args[0];
  log.apply(null, args);
};

Visitor.prototype.increaseLevel=function(){
  ++this._level;
  this._prefix+='|';
};

Visitor.prototype.decreaseLevel=function(){
  --this._level;
  this._prefix=this._prefix.substring(1);
};

Visitor.prototype.visitWrap=function(func)
{
  this.increaseLevel();
  this.log('--<');
  func.call(this);
  this.log('--<');
  this.decreaseLevel();
};

Visitor.prototype.visitObj=function(obj, map)
{
  this.log(JSON.stringify(obj));
  this.visitWrap(function(){
    for(var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.log('Node:', i);
        if(map[i]){
          map[i].call(this, obj[i]);
        }
      }
    }
  });
};

Visitor.prototype.visitArr=function(arr, func)
{
  var na = [].concat(arr);
  this.visitWrap(function(){
    for(var i in na) {
      this.log('Arr['+i+']:'+na[i]);
      func.call(this, na[i]);
    }
  });
};