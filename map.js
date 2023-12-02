var mapContainer = document.getElementById('map-section'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(35.888118, 128.6115287), // 지도의 중심좌표
        level: 4 // 지도의 확대 레벨
    };
var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

let lat, lng;
const positions = [
  {
    content: '<div>Pottery Studio</div>', 
    latlng: new kakao.maps.LatLng(35.883742, 128.6015189)
  },
  {
    content: '<div>Music Studio</div>', 
    latlng: new kakao.maps.LatLng(35.889267, 128.6192035)
  },
  {
    content: '<div>Sports Lounge</div>', 
    latlng: new kakao.maps.LatLng(35.886841, 128.6173976)
  },
  {
    content: '<div>Cooking Studio</div>', 
    latlng: new kakao.maps.LatLng(35.884453, 128.6148729)
  },
  {
    content: '<div>Party Room</div>', 
    latlng: new kakao.maps.LatLng(35.886314, 128.6215092)
  },
  {
    content: '<div>Candle Studio</div>',
    latlng: new kakao.maps.LatLng(35.887264, 128.6159813)
  },
  {
    content: '<div>Cinema</div>', 
    latlng: new kakao.maps.LatLng(35.882458, 128.6107630)
  },
  {
    content: '<div>Office</div>', 
    latlng: new kakao.maps.LatLng(35.885186, 128.6194027)
  },
  {
    content: '<div>Camping Site</div>', 
    latlng: new kakao.maps.LatLng(35.888592, 128.6171375)
  },
  {
    content: '<div>Lecture Room</div>', 
    latlng: new kakao.maps.LatLng(35.886948, 128.6083207)
  },
];
// fetch("http://127.0.0.1:5500")
// .then(response => response.json())
// .then(data => {
//     data.forEach((item) => {
//         lat = item.latitude;
//         lng = item.longitude;
//         const toPush = {
//             content: "<div>" + item.name + "<div>",
//             latlng: new kakao.maps.LatLng(lat, lng)
//         };
//         positions.push(toPush);
//     });

//     // 여기서 마커 생성 코드를 호출합니다.
//     createMarkers();
// })
// .catch(error => console.error('Error: ', error));

function createMarkers() {
  let isFirst = true;
  for (var i = 0; i < positions.length; i++) {
    if (isFirst) {
      isFirst = false;
    }
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: positions[i].latlng // 마커의 위치
    });

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: positions[i].content // 인포윈도우에 표시할 내용
    });

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
    kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
  }
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
function makeOverListener(map, marker, infowindow) {
  return function () {
    infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}


var drawingFlag = false; // 원이 그려지고 있는 상태를 가지고 있을 변수입니다
var centerPosition; // 원의 중심좌표 입니다
var drawingCircle; // 그려지고 있는 원을 표시할 원 객체입니다
var drawingLine; // 그려지고 있는 원의 반지름을 표시할 선 객체입니다
var drawingOverlay; // 그려지고 있는 원의 반경을 표시할 커스텀오버레이 입니다
var drawingDot; // 그려지고 있는 원의 중심점을 표시할 커스텀오버레이 입니다

var circles = []; // 클릭으로 그려진 원과 반경 정보를 표시하는 선과 커스텀오버레이를 가지고 있을 배열입니다
// 지도에 클릭 이벤트를 등록합니다(1)
kakao.maps.event.addListener(map, "click", function (mouseEvent) {
  // 클릭 이벤트가 발생했을 때 원을 그리고 있는 상태가 아니면 중심좌표를 클릭한 지점으로 설정합니다
  if (!drawingFlag) {
    removeCircles(); // 원 새로 그리면 그 전의 원을 지움
    // 상태를 그리고있는 상태로 변경합니다
    drawingFlag = true;

    // 원이 그려질 중심좌표를 클릭한 위치로 설정합니다
    centerPosition = mouseEvent.latLng;

    // 그려지고 있는 원의 반경을 표시할 선 객체를 생성합니다
    if (!drawingLine) {
      drawingLine = new kakao.maps.Polyline({
        strokeWeight: 3, // 선의 두께입니다
        strokeColor: "#00a0e9", // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
        strokeStyle: "solid", // 선의 스타일입니다
      });
    }

    // 그려지고 있는 원을 표시할 원 객체를 생성합니다
    if (!drawingCircle) {
      drawingCircle = new kakao.maps.Circle({
        strokeWeight: 1, // 선의 두께입니다
        strokeColor: "#00a0e9", // 선의 색깔입니다
        strokeOpacity: 0.1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
        strokeStyle: "solid", // 선의 스타일입니다
        fillColor: "#00a0e9", // 채우기 색깔입니다
        fillOpacity: 0.2, // 채우기 불투명도입니다
      });
    }

    // 그려지고 있는 원의 반경 정보를 표시할 커스텀오버레이를 생성합니다
    if (!drawingOverlay) {
      drawingOverlay = new kakao.maps.CustomOverlay({
        xAnchor: 0,
        yAnchor: 0,
        zIndex: 1,
      });
    }
  }
});

// 지도에 마우스무브 이벤트를 등록합니다. 원을 그리고있는 상태에서 마우스무브 이벤트가 발생하면 그려질 원의 위치와 반경정보를 동적으로 보여주도록 합니다
kakao.maps.event.addListener(map, "mousemove", function (mouseEvent) {
  // 마우스무브 이벤트가 발생했을 때 원을 그리고있는 상태이면
  if (drawingFlag) {
    // 마우스 커서의 현재 위치를 얻어옵니다
    var mousePosition = mouseEvent.latLng;

    // 그려지고 있는 선을 표시할 좌표 배열입니다. 클릭한 중심좌표와 마우스커서의 위치로 설정합니다
    var linePath = [centerPosition, mousePosition];

    // 그려지고 있는 선을 표시할 선 객체에 좌표 배열을 설정합니다
    drawingLine.setPath(linePath);

    // 원의 반지름을 선 객체를 이용해서 얻어옵니다
    var length = drawingLine.getLength();

    if (length > 0) {
        // 그려지고 있는 원의 중심좌표와 반지름입니다
        var circleOptions = {
            center: centerPosition,
            radius: length,
        };

        // 그려지고 있는 원의 옵션을 설정합니다
        drawingCircle.setOptions(circleOptions);

        // 반경 정보를 표시할 커스텀오버레이의 내용입니다
        var radius = Math.round(drawingCircle.getRadius()),
            content =
                '<div class="info">반경 <span class="number">' +
                radius +
                "</span>m</div>";

        // 반경 정보를 표시할 커스텀 오버레이의 좌표를 마우스커서 위치로 설정합니다
        drawingOverlay.setPosition(mousePosition);

        // 반경 정보를 표시할 커스텀 오버레이의 표시할 내용을 설정합니다
        drawingOverlay.setContent(content);

        // 그려지고 있는 원을 지도에 표시합니다
        drawingCircle.setMap(map);

        // 그려지고 있는 선을 지도에 표시합니다
        drawingLine.setMap(map);

        // 그려지고 있는 원의 반경정보 커스텀 오버레이를 지도에 표시합니다
        drawingOverlay.setMap(map);
    } else {
        drawingCircle.setMap(null);
        drawingLine.setMap(null);
        drawingOverlay.setMap(null);
    }
  }
});

// 지도에 마우스 클릭이벤트를 등록합니다. 원을 그리고있는 상태에서 마우스 클릭 이벤트가 두번째로 발생하면 마우스 클릭한 위치를 기준으로 원과 원의 반경정보를 표시하는 선과 커스텀 오버레이를 표시하고 그리기를 종료합니다
kakao.maps.event.addListener(map, "rightclick", function (mouseEvent) {
  if (drawingFlag) {
    // 마우스로 두번째 클릭한 위치입니다
    var rClickPosition = mouseEvent.latLng;

    // 원의 반경을 표시할 선 객체를 생성합니다
    var polyline = new kakao.maps.Polyline({
      path: [centerPosition, rClickPosition], // 선을 구성하는 좌표 배열입니다. 원의 중심좌표와 클릭한 위치로 설정합니다
      strokeWeight: 3, // 선의 두께 입니다
      strokeColor: "#00a0e9", // 선의 색깔입니다
      strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
      strokeStyle: "solid", // 선의 스타일입니다
    });

      // 원 객체를 생성합니다
    var circle = new kakao.maps.Circle({
      center: centerPosition, // 원의 중심좌표입니다
      radius: polyline.getLength(), // 원의 반지름입니다 m 단위 이며 선 객체를 이용해서 얻어옵니다
      strokeWeight: 1, // 선의 두께입니다
      strokeColor: "#00a0e9", // 선의 색깔입니다
      strokeOpacity: 0.1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
      strokeStyle: "solid", // 선의 스타일입니다
      fillColor: "#00a0e9", // 채우기 색깔입니다
      fillOpacity: 0.2, // 채우기 불투명도입니다
    });

    var radius = Math.round(circle.getRadius()), // 원의 반경 정보를 얻어옵니다
      content = getTimeHTML(radius); // 커스텀 오버레이에 표시할 반경 정보입니다

    // 반경정보를 표시할 커스텀 오버레이를 생성합니다
    var radiusOverlay = new kakao.maps.CustomOverlay({
      content: content, // 표시할 내용입니다
      position: rClickPosition, // 표시할 위치입니다. 클릭한 위치로 설정합니다
      xAnchor: 0,
      yAnchor: 0,
      zIndex: 1,
    });

    // 원을 지도에 표시합니다
    circle.setMap(map);

    // 선을 지도에 표시합니다
    polyline.setMap(map);

    // 반경 정보 커스텀 오버레이를 지도에 표시합니다
    radiusOverlay.setMap(map);

    // 배열에 담을 객체입니다. 원, 선, 커스텀오버레이 객체를 가지고 있습니다
    var radiusObj = {
        polyline: polyline,
        circle: circle,
        overlay: radiusOverlay,
    };

    // 배열에 추가합니다. 이 배열을 이용해서 "모두 지우기" 버튼을 클릭했을 때 지도에 그려진 원, 선, 커스텀오버레이들을 지웁니다
    circles.push(radiusObj);

    // 그리기 상태를 그리고 있지 않는 상태로 바꿉니다
    drawingFlag = false;

    // 중심 좌표를 초기화 합니다
    centerPosition = null;

    // 그려지고 있는 원, 선, 커스텀오버레이를 지도에서 제거합니다
    drawingCircle.setMap(null);
    drawingLine.setMap(null);
    drawingOverlay.setMap(null);
  }
});

// 지도에 표시되어 있는 모든 원과 반경정보를 표시하는 선, 커스텀 오버레이를 지도에서 제거합니다
function removeCircles() {
  for (var i = 0; i < circles.length; i++) {
    circles[i].circle.setMap(null);
    circles[i].polyline.setMap(null);
    circles[i].overlay.setMap(null);
  }
  circles = [];
}

// 마우스 두번째 클릭 하여 원 그리기가 종료됐을 때 호출하여 그려진 원의 반경 정보와 반경에 대한 도보, 자전거 시간을 계산하여 HTML Content를 만들어 리턴하는 함수입니다
function getTimeHTML(distance) {
  // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
  var walkkTime = (distance / 67) | 0;
  var walkHour = "", walkMin = "";

  // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
  if (walkkTime > 60) {
    walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + "</span>시간 ";
  }
  walkMin = '<span class="number">' + (walkkTime % 60) + "</span>분";

  // 자전거의 평균 시속은 16km/h 이고 이것을 기준으로 자전거의 분속은 267m/min입니다
  var bycicleTime = (distance / 227) | 0;
  var bycicleHour = "", bycicleMin = "";

  // 계산한 자전거 시간이 60분 보다 크면 시간으로 표출합니다
  if (bycicleTime > 60) {
    bycicleHour = '<span class="number">' + Math.floor(bycicleTime / 60) + "</span>시간 ";
  }
  bycicleMin = '<span class="number">' + (bycicleTime % 60) + "</span>분";

  // 거리와 도보 시간, 자전거 시간을 가지고 HTML Content를 만들어 리턴합니다
  var content = '<ul class="info">';
  content += "    <li>";
  content += '        <span class="label">총거리</span><span class="number">' + distance + "</span>m";
  content += "    </li>";
  content += "    <li>";
  content += '        <span class="label">도보</span>' + walkHour + walkMin;
  content += "    </li>";
  content += "    <li>";
  content += '        <span class="label">자전거</span>' + bycicleHour + bycicleMin;
  content += "    </li>";
  content += "</ul>";

  return content;
}

// 🔥Edward🔥: 사용자의 위치 표시
// HTML5의 geolocation으로 사용할 수 있는지 확인합니다 
if (navigator.geolocation) {
    
  // GeoLocation을 이용해서 접속 위치를 얻어옵니다
  navigator.geolocation.getCurrentPosition(function(position) {
      
      var lat = position.coords.latitude, // 위도
          lon = position.coords.longitude; // 경도
      
      var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
          message = '<div style="padding:5px;">Your Location</div>'; // 인포윈도우에 표시될 내용입니다
      
      // 마커와 인포윈도우를 표시합니다
      displayMarker(locPosition, message);
          
    });
  
} else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
  
  var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),    
      message = 'geolocation을 사용할수 없어요..'
      
  displayMarker(locPosition, message);
}

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {

  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({  
      map: map, 
      position: locPosition
  }); 
  
  var iwContent = message, // 인포윈도우에 표시할 내용
      iwRemoveable = true;

  // 인포윈도우를 생성합니다
  var infowindow = new kakao.maps.InfoWindow({
      content : iwContent,
      removable : iwRemoveable
  });
  
  // 인포윈도우를 마커위에 표시합니다 
  infowindow.open(map, marker);
  
  // 지도 중심좌표를 접속위치로 변경합니다
  map.setCenter(locPosition);      
}

// Edward🔥: 미리 입력된 정보 표시
for (var i = 0; i < positions.length; i ++) {
  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: positions[i].latlng // 마커의 위치
  });

  // 마커에 표시할 인포윈도우를 생성합니다 
  var infowindow = new kakao.maps.InfoWindow({
      content: positions[i].content // 인포윈도우에 표시할 내용
  });

  // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
  // 이벤트 리스너로는 클로저를 만들어 등록합니다 
  // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
  kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
  kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow) {
  return function() {
      infowindow.open(map, marker);
  };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
  return function() {
      infowindow.close();
  };
}

// Edward🔥: 교통정보
// 지도에 교통정보를 표시하도록 지도타입을 추가합니다
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC); 