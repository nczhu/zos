import _ from 'lodash'
import ZosNetworkFile from './ZosNetworkFile'
import { Logger, FileSystem as fs } from 'zos-lib'
import Dependency from '../dependency/Dependency';
import { ZOS_VERSION, checkVersion } from './ZosVersion';

const log = new Logger('ZosPackageFile')

export default class ZosPackageFile {

  constructor(fileName = 'zos.json') {
    this.fileName = fileName
    this.data = fs.parseJsonIfExists(this.fileName) || { zosversion: ZOS_VERSION }
    checkVersion(this.data.zosversion, this.fileName)
  }

  exists() {
    return fs.exists(this.fileName)
  }

  get lib() {
    return this.data.lib
  }
  
  get name() {
    return this.data.name
  }

  get version() {
    return this.data.version
  }

  get dependencies() {
    return this.data.dependencies || {}
  }

  get dependenciesNames() {
    return Object.keys(this.dependencies)
  }

  getDependencyVersion(name) {
    return this.dependencies[name]
  }

  hasDependency(name) {
    return !!(this.dependencies[name])
  }

  hasDependencies() {
    return !_.isEmpty(this.dependencies)
  }

  get contracts() {
    return this.data.contracts || {}
  }

  get contractAliases() {
    return Object.keys(this.contracts)
  }

  get contractNames() {
    return Object.values(this.contracts)
  }

  get isLib() {
    return !!this.lib
  }

  get isLightweight() {
    return !this.data.publish && !this.isLib
  }

  contract(alias) {
    return this.contracts[alias]
  }

  hasName(name) {
    return this.name === name
  }

  dependencyMatches(name, version) {
    return this.hasDependency(name) && 
      Dependency.satisfiesVersion(version, this.getDependencyVersion(name))
  }

  isCurrentVersion(version) {
    return this.version === version
  }

  hasContract(alias) {
    return !!this.contract(alias)
  }

  hasContracts() {
    return !_.isEmpty(this.contracts)
  }

  set lib(lib) {
    this.data.lib = lib
  }

  set publish(publish) {
    this.data.publish = !!publish
  }

  set name(name) {
   this.data.name = name
  }

  set version(version) {
    this.data.version = version
  }

  set contracts(contracts) {
    this.data.contracts = contracts
  }

  setDependency(name, version) {
    if (!this.data.dependencies) this.data.dependencies = {};
    this.data.dependencies[name] = version;
  }

  unsetDependency(name) {
    if (!this.data.dependencies) return;
    delete this.data.dependencies[name];
  }

  addContract(alias, name = undefined) {
    this.data.contracts[alias] = name || alias;
  }

  unsetContract(alias) {
    delete this.data.contracts[alias];
  }

  networkFile(network) {
    const networkFileName = this.fileName.replace(/\.json\s*$/, `.${network}.json`)
    if(networkFileName === this.fileName) throw Error(`Cannot create network file name from ${this.fileName}`)
    return new ZosNetworkFile(this, network, networkFileName)
  }

  write() {
    fs.writeJson(this.fileName, this.data)
    log.info(`Successfully written ${this.fileName}`)
  }
}
