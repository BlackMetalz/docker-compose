import jenkins.model.*
import hudson.ProxyConfiguration

def instance = Jenkins.getInstance()

// Define proxy settings
def proxyHost = "10.0.0.1"
def proxyPort = 8800
def noProxyHosts = "localhost,127.0.0.1"

// Check if we're getting proper values
println "Setting proxy with host: ${proxyHost}, port: ${proxyPort}"

// Configure the proxy with host and port explicitly
def pc = new ProxyConfiguration(proxyHost, proxyPort, null, null, noProxyHosts)
instance.proxy = pc
instance.save()
println "Proxy configuration updated!"
