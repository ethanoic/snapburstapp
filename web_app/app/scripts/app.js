
/** @jsx React.DOM */

var padtext = function(text, paddingChar, length) {
    for (var i=0; i<=(length - text.length); i++) {
        text = paddingChar + text;
    }
    return text;
};

var cameraStreamView = React.createClass({
    getInitialState: function() {
        return {
            data:true
        };
    },
    componentDidMount: function() {

    },
    render: function() {
        return (
            <canvas id="canvascameraview"></canvas>
        );
    }
});

var loadingView = React.createClass({
    getInitialState: function() {
        return {
            loadingComplete : false
        };
    },
    componentDidMount: function() {
        // hide this
        this.setState({
            loadingComplete : true
        });
    },
    render: function() {
        return (
            <label>Loading Assets</label>
        );
    }
});

var flipCanvas = React.createClass({
    getInitialState: function() {
        return {
            images: []
        }  
    },
    componentDidMount: function() {
        $.get( this.props.url, function( result ) {
            
            var set = parseInt(this.props.set);
            var getImages = new Array(result[set].end);

            for(var k=result[set].start; k<result[set].end; k++) {
                getImages[k] = 'data/' + result[k].prefix + '_' + padtext('' + result[k].start, '0', 3) + '.' + result[k].type;
            }

            this.setState({
                images : getImages
            });
        }.bind(this));
    },
    render: function() {
        return (
            <canvas id="canvas"></canvas>
        );
    }
});

var flipGallery = React.createClass({
    getInitialState: function() {
        return {
            thumbs: []
        };
    },
    componentDidMount: function() {
        $.get( this.props.url, function( result ) {
            var getThumbs = new Array(result.length);
            for(var k=0; k<result.length; k++) {
                getThumbs[k] = {
                    src : 'data/' + result[k].prefix + '_' + padtext('' + result[k].start, '0', 3) + '.' + result[k].type,
                    id : k
                }
            }
            this.setState({
                thumbs : getThumbs
            });
        }.bind(this));
    },
    render: function() {
        var flipGalleryNodes = this.state.thumbs.map(function(thumbnail) {
            return <flipGalleryThumb img={thumbnail.src} id={thumbnail.id} />;
        });
        return (
            <div className="row">
                {flipGalleryNodes}
            </div>
        );

    }
});

var flipGalleryThumb = React.createClass({
    handleClick: function(event) {
        console.log('click', event.target.getAttribute('data-set'));

        React.renderComponent(
            <flipCanvas url="data/data.json" set={event.target.getAttribute('data-set')} />,
            document.getElementById('viewflip')
        );

    },
    render: function() {
        return (
            <div className="col-xs-6 col-md-3">
                <a className="thumbnail">
                    <img data-set={this.props.id} data-src="holder.js/100%x100" src={this.props.img} alt="" onClick={this.handleClick.bind(this)}  />
                </a>
            </div>
        );
    }
});

var selectPhotosView = React.createClass({
    getInitialState: function() {
        return {
            photos:[]
        };
    },
    componentDidMount: function() {
        // load images from json or phonegap storage reader
        $.get( this.props.url, function( result ) {
            this.setState({
                photos : result
            });
        }.bind(this));
    },
    render: function() {
        var thumbnailNodes = this.state.photos.map(function(photo) {
            return <photoThumb img={photo.src}  />;
        });
        return (
            <div className="row">
                {thumbnailNodes}
            </div>
        );
    }
});

var photoThumb = React.createClass({
    handleClick: function(event) {
    },
    componentDidMount: function() {
    },
    render: function() {
        return (
            <div className="col-xs-6 col-md-3">
                <a className="thumbnail">
                    <img data-src="holder.js/100%x100" src={this.props.img} alt="" onClick={this.handleClick.bind(this)}  />
                </a>
            </div>
        );
    }
});

React.renderComponent(
    <flipGallery url="data/data.json" />,
    document.getElementById('gallery')
);

React.renderComponent(
    <loadingView />,
    document.getElementById('loading')
);

React.renderComponent(
    <selectPhotosView url="data/photos.json" />,
    document.getElementById('selectphotosview')
);


