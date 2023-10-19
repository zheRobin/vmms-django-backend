if [[ $(tac /etc/httpd/conf/httpd.conf | egrep -m 1 .) == $(echo 'WSGIPassAuthorization On') ]];
  then
     echo "Httpd.conf has already been patched"
  else
     echo "Patching Httpd.conf.."
     echo 'WSGIPassAuthorization On' >> /etc/httpd/conf/httpd.conf
     service httpd restart
     echo "Patched."
fi