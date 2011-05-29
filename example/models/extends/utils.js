//only additionals function, I have'nt find a proper clone method for object in node.js, but I'm sure there's one, so if you can send me a message to tell me how I can use a built-in one, I will be very pleased !

Object.defineProperty(Object.prototype, 'extend', {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
        });
        return this;
    }
});